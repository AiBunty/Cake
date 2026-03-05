"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCart, clearCart } from "@/lib/cart";
import { Cart, TimeSlot, OrderData, Settings } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { formatCurrency, getCurrentTimezone, getMinPickupDate, getMaxPickupDate, formatTime12h } from "@/lib/utils";
import { getTimeSlots, createOrder, getSettings, submitUpiPayment } from "@/lib/api";
import { Calendar, Clock, CreditCard, QrCode, Smartphone } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "UPI">("RAZORPAY");
  const [settings, setSettings] = useState<Settings>({});
  const [upiOrderId, setUpiOrderId] = useState("");
  const [upiLink, setUpiLink] = useState("");
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [upiUtr, setUpiUtr] = useState("");
  const [upiScreenshotFile, setUpiScreenshotFile] = useState<File | null>(null);
  const [upiUtrError, setUpiUtrError] = useState("");
  const [submittingUpi, setSubmittingUpi] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    pickup_date: getMinPickupDate(),
    pickup_slot_label: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const currentCart = getCart();
    if (currentCart.items.length === 0) {
      router.push("/cart");
      return;
    }
    setCart(currentCart);
  }, [router]);

  useEffect(() => {
    if (formData.pickup_date) {
      fetchTimeSlots(formData.pickup_date);
    }
  }, [formData.pickup_date]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await getSettings();
      if (response.ok && response.data) {
        setSettings(response.data as Settings);
      }
    };

    fetchSettings();
  }, []);

  const fetchTimeSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const response = await getTimeSlots(date);
      if (response.ok && response.data) {
        const slots = response.data as TimeSlot[];
        setTimeSlots(slots.filter((s) => s.is_open));
      }
    } catch (error) {
      console.error("Failed to fetch time slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!formData.pickup_date) {
      newErrors.pickup_date = "Pickup date is required";
    }
    if (!formData.pickup_slot_label) {
      newErrors.pickup_slot_label = "Please select a pickup time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => reject(new Error("Failed to read screenshot file"));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setProcessing(true);

    try {
      const selectedSlot = timeSlots.find(
        (s) => s.slot_label === formData.pickup_slot_label
      );

      if (!selectedSlot) {
        alert("Selected time slot is no longer available");
        setProcessing(false);
        return;
      }

      const orderData: OrderData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email,
        pickup_date: formData.pickup_date,
        pickup_slot_label: selectedSlot.slot_label,
        pickup_start_time: selectedSlot.start_time,
        pickup_end_time: selectedSlot.end_time,
        pickup_timezone: getCurrentTimezone(),
        cart_json: JSON.stringify(cart.items),
        subtotal_inr: cart.total,
        payment_method: paymentMethod,
        notes: formData.notes || "",
      };

      const orderResponse = await createOrder(orderData);

      if (!orderResponse.ok || !orderResponse.data) {
        throw new Error(orderResponse.error || "Failed to create order");
      }

      const order = orderResponse.data as any;

      if (paymentMethod === "UPI") {
        const upiVpa = (settings.upi_vpa || "").toString().trim();
        const upiPayeeName = (settings.upi_payee_name || "").toString().trim();

        if (!upiVpa || !upiPayeeName) {
          throw new Error("UPI settings are missing (upi_vpa / upi_payee_name)");
        }

        const note = `Cake Order ${order.order_id}`;
        const query = new URLSearchParams({
          pa: upiVpa,
          pn: upiPayeeName,
          am: cart.total.toFixed(2),
          cu: "INR",
          tn: note,
        });
        const generatedUpiLink = `upi://pay?${query.toString()}`;

        setUpiOrderId(order.order_id);
        setUpiLink(generatedUpiLink);
        setUpiQrUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(generatedUpiLink)}`
        );
        setProcessing(false);
        return;
      }

      // Create Razorpay order
      const razorpayResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cart.total,
          order_id: order.order_id,
        }),
      });

      if (!razorpayResponse.ok) {
        throw new Error("Failed to create payment");
      }

      const razorpayOrder = await razorpayResponse.json();

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Cake Studio",
        description: "Cake Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: order.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            clearCart();
            window.dispatchEvent(new Event("cartUpdated"));
            router.push(`/success?order_id=${order.order_id}`);
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        prefill: {
          name: formData.customer_name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#FF4FB7",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process checkout. Please try again.");
      setProcessing(false);
    }
  };

  const handleUpiSubmit = async () => {
    if (!upiOrderId) {
      return;
    }

    if (!upiUtr.trim()) {
      setUpiUtrError("UTR / Transaction ID is required");
      return;
    }

    setUpiUtrError("");
    setSubmittingUpi(true);

    try {
      const screenshotDataUrl = upiScreenshotFile ? await toDataUrl(upiScreenshotFile) : "";

      const response = await submitUpiPayment({
        order_id: upiOrderId,
        upi_utr: upiUtr.trim(),
        screenshot_data_url: screenshotDataUrl,
        screenshot_file_name: upiScreenshotFile?.name || "",
      });

      if (!response.ok) {
        throw new Error(response.error || "Failed to submit UPI details");
      }

      clearCart();
      window.dispatchEvent(new Event("cartUpdated"));
      router.push(`/success?order_id=${upiOrderId}&payment_method=UPI&payment_status=PENDING_VERIFICATION`);
    } catch (error) {
      console.error("UPI submit error:", error);
      alert("Failed to submit UPI payment details. Please try again.");
    } finally {
      setSubmittingUpi(false);
    }
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-display font-semibold mb-2">
              <span className="gradient-text">Checkout</span>
            </h1>
            <p className="text-muted text-lg">Select pickup time, pay securely, collect without waiting</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <div className="glass-panel p-6 space-y-4 shadow-lg">
                <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                  <span className="text-rose">01</span> Customer Details
                </h2>

                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  error={errors.customer_name}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  error={errors.phone}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors.email}
                  required
                />
              </div>

              {/* Pickup Schedule */}
              <div className="glass-panel p-6 space-y-4 shadow-lg">
                <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                  <span className="text-rose">02</span> Pickup Schedule
                </h2>

                <div className="flex items-start gap-2">
                  <Calendar className="text-rose mt-3" size={20} />
                  <Input
                    label="Pickup Date"
                    type="date"
                    min={getMinPickupDate()}
                    max={getMaxPickupDate()}
                    value={formData.pickup_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup_date: e.target.value,
                        pickup_slot_label: "",
                      })
                    }
                    error={errors.pickup_date}
                    required
                    className="flex-1"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="text-rose mt-3" size={20} />
                  <Select
                    label="Pickup Time"
                    value={formData.pickup_slot_label}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup_slot_label: e.target.value,
                      })
                    }
                    error={errors.pickup_slot_label}
                    disabled={loadingSlots || timeSlots.length === 0}
                    required
                    className="flex-1"
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option
                        key={slot.slot_label}
                        value={slot.slot_label}
                        disabled={
                          slot.available_slots !== undefined &&
                          slot.available_slots <= 0
                        }
                      >
                        {formatTime12h(slot.start_time)} -{" "}
                        {formatTime12h(slot.end_time)}
                        {slot.available_slots !== undefined &&
                          ` (${slot.available_slots} slots left)`}
                      </option>
                    ))}
                  </Select>
                </div>

                <Input
                  label="Special Instructions (Optional)"
                  placeholder="Any special requests or allergy information"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="glass-panel p-6 space-y-4 shadow-lg">
                <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                  <span className="text-rose">03</span> Payment Method
                </h2>

                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    className={`text-left rounded-2xl border px-4 py-3 transition-all ${
                      paymentMethod === "RAZORPAY"
                        ? "border-rose/60 bg-rose/10"
                        : "border-stroke bg-panel/40 hover:border-rose/30"
                    }`}
                  >
                    <p className="font-semibold text-text">Razorpay</p>
                    <p className="text-xs text-muted">Auto-confirm after payment</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`text-left rounded-2xl border px-4 py-3 transition-all ${
                      paymentMethod === "UPI"
                        ? "border-rose/60 bg-rose/10"
                        : "border-stroke bg-panel/40 hover:border-rose/30"
                    }`}
                  >
                    <p className="font-semibold text-text">UPI (Free)</p>
                    <p className="text-xs text-muted">Manual verification with UTR</p>
                  </button>
                </div>
              </div>

              {paymentMethod === "UPI" && upiOrderId && (
                <div className="glass-panel p-6 space-y-5 shadow-lg">
                  <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                    <QrCode className="text-rose" size={20} /> Complete UPI Payment
                  </h2>

                  <div className="space-y-2">
                    <p className="text-sm text-muted">Order ID: <span className="font-mono text-text">{upiOrderId}</span></p>
                    <p className="text-sm text-muted">Amount: <span className="text-text font-semibold">{formatCurrency(cart.total)}</span></p>
                    <p className="text-sm text-muted">UPI ID: <span className="font-mono text-text">{settings.upi_vpa || "Not configured"}</span></p>
                  </div>

                  {upiQrUrl && (
                    <div className="rounded-2xl border border-stroke p-4 w-fit bg-white">
                      <img src={upiQrUrl} alt="UPI QR Code" className="w-52 h-52 sm:w-64 sm:h-64" />
                    </div>
                  )}

                  {upiLink && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => {
                        window.location.href = upiLink;
                      }}
                    >
                      <Smartphone size={18} />
                      <span>Pay via UPI App</span>
                    </Button>
                  )}

                  <div className="space-y-4 pt-2 border-t border-stroke">
                    <Input
                      label="UTR / Transaction ID"
                      placeholder="Enter UTR number"
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value)}
                      error={upiUtrError}
                      required
                    />

                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-sm font-medium text-muted">Payment Screenshot (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUpiScreenshotFile(e.target.files?.[0] || null)}
                        className="glass-panel px-4 py-3 rounded-2xl bg-panel/50 border border-stroke text-text"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      isLoading={submittingUpi}
                      disabled={submittingUpi}
                      onClick={handleUpiSubmit}
                      className="w-full"
                    >
                      Submit UPI Payment Details
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={processing}
                disabled={processing || (paymentMethod === "UPI" && !!upiOrderId)}
                className="w-full text-lg py-4 group"
              >
                <CreditCard size={20} />
                <span>
                  {paymentMethod === "UPI"
                    ? upiOrderId
                      ? "Order Created for UPI Payment"
                      : `Proceed with UPI ${formatCurrency(cart.total)}`
                    : `Pay ${formatCurrency(cart.total)}`}
                </span>
              </Button>
            </form>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-panel glow-border p-6 space-y-4 sticky top-24 shadow-xl shadow-rose/10">
                <h2 className="text-xl font-display font-semibold">Order Summary</h2>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.product.price_inr * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stroke pt-3">
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className="gradient-text text-2xl">
                      {formatCurrency(cart.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
