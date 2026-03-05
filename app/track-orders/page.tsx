"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrdersByCustomer } from "@/lib/api";
import { Order } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { Search, Package, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function TrackOrdersPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      setError("Please enter either email or phone number");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await getOrdersByCustomer(email, phone);
      
      if (response.ok && response.data) {
        setOrders(response.data as Order[]);
      } else {
        setError(response.error || "Failed to retrieve orders");
        setOrders([]);
      }
    } catch (err) {
      setError("An error occurred while retrieving orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600";
      case "CREATED":
        return "text-yellow-600";
      case "FAILED":
        return "text-red-600";
      default:
        return "text-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="text-green-600" size={20} />;
      case "CREATED":
        return <AlertCircle className="text-yellow-600" size={20} />;
      case "FAILED":
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Package className="text-muted" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Payment Confirmed";
      case "CREATED":
        return "Awaiting Payment";
      case "FAILED":
        return "Payment Failed";
      default:
        return status;
    }
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    try {
      const date = new Date(dateStr);
      const dateFormatted = date.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return `${dateFormatted} at ${timeStr}`;
    } catch {
      return `${dateStr} at ${timeStr}`;
    }
  };

  const parseCartJson = (cartJson: string) => {
    try {
      const cart = JSON.parse(cartJson);
      return cart.items || [];
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block glass-panel p-6 rounded-full mb-4 shadow-lg shadow-rose/10">
              <Package size={48} className="text-rose" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold">
              Track Your Orders
            </h1>
            <p className="text-muted text-lg">
              Enter your email or phone number to view your order history
            </p>
          </div>

          {/* Search Form */}
          <Card className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                
                <div className="text-center text-muted text-sm">- OR -</div>
                
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || (!email && !phone)}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      <Search size={20} />
                    </motion.div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} className="mr-2" />
                    Search Orders
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Orders List */}
          <AnimatePresence mode="wait">
            {searched && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {orders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package size={48} className="text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                    <p className="text-muted">
                      We couldn&apos;t find any orders matching your details.
                    </p>
                  </Card>
                ) : (
                  <>
                    <div className="text-lg font-semibold">
                      Found {orders.length} order{orders.length !== 1 ? "s" : ""}
                    </div>

                    {orders.map((order, index) => (
                      <motion.div
                        key={order.order_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-6 space-y-4">
                          {/* Order Header */}
                          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                            <div>
                              <div className="text-sm text-muted mb-1">Order ID</div>
                              <div className="font-mono font-semibold text-lg">
                                {order.order_id}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.payment_status)}
                              <span className={`font-semibold ${getStatusColor(order.payment_status)}`}>
                                {getStatusText(order.payment_status)}
                              </span>
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <Calendar className="text-rose mt-1" size={20} />
                              <div>
                                <div className="text-sm text-muted">Pickup Date</div>
                                <div className="font-medium">
                                  {formatDateTime(order.pickup_date, order.pickup_start_time)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Clock className="text-rose mt-1" size={20} />
                              <div>
                                <div className="text-sm text-muted">Time Slot</div>
                                <div className="font-medium">{order.pickup_slot_label}</div>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="pt-4 border-t border-border">
                            <div className="text-sm font-semibold mb-3">Order Items</div>
                            <div className="space-y-2">
                              {parseCartJson(order.cart_json).map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <div>
                                    <span className="font-medium">{item.product.name}</span>
                                    <span className="text-muted"> × {item.quantity}</span>
                                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                                      <div className="text-xs text-muted ml-2">
                                        + {item.selectedToppings.map((t: any) => 
                                          `${t.topping.name} (×${t.quantity})`
                                        ).join(", ")}
                                      </div>
                                    )}
                                  </div>
                                  <div className="font-medium">
                                    {formatCurrency(item.product.price_inr * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="text-lg font-semibold">Total Amount</span>
                            <span className="text-xl font-bold text-rose">
                              {formatCurrency(order.subtotal_inr)}
                            </span>
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="pt-4 border-t border-border">
                              <div className="text-sm text-muted mb-1">Special Instructions</div>
                              <div className="text-sm">{order.notes}</div>
                            </div>
                          )}

                          {/* Order Date */}
                          <div className="text-xs text-muted text-right">
                            Ordered on {new Date(order.created_at).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
