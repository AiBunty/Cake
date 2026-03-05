"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCart, clearCart } from "@/lib/cart";
import { Cart, TimeSlot, OrderData } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { formatCurrency, getCurrentTimezone, getMinPickupDate, getMaxPickupDate, formatTime12h } from "@/lib/utils";
import { getTimeSlots, createOrder } from "@/lib/api";
import { Calendar, Clock, CreditCard } from "lucide-react";

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
        notes: formData.notes || "",
      };

      const orderResponse = await createOrder(orderData);

      if (!orderResponse.ok || !orderResponse.data) {
        throw new Error(orderResponse.error || "Failed to create order");
      }

      const order = orderResponse.data as any;

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

              <Button
                type="submit"
                variant="primary"
                isLoading={processing}
                disabled={processing}
                className="w-full text-lg py-4 group"
              >
                <CreditCard size={20} />
                <span>Pay {formatCurrency(cart.total)}</span>
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
