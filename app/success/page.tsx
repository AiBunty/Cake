"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, Package } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">No order information found.</p>
        <Link href="/">
          <Button variant="primary" className="mt-4">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel glow-border p-8 space-y-8 text-center shadow-2xl shadow-rose/20"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-rose via-violet to-lav/50 relative"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-rose to-violet opacity-40 blur-xl"
          />
          <CheckCircle size={48} className="text-white relative z-10" />
        </motion.div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-display font-semibold">
            <span className="gradient-text">Order Confirmed!</span>
          </h1>
          <p className="text-xl text-muted">
            Your payment was successful
          </p>
        </div>

        {/* Order ID */}
        <div className="glass-panel p-4 rounded-2xl shadow-inner">
          <p className="text-sm text-muted mb-1">Order ID</p>
          <p className="font-mono text-lg font-semibold text-rose">{orderId}</p>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4 pt-4">
          <div className="glass-panel p-4 rounded-2xl space-y-2">
            <Package className="text-rose mx-auto" size={24} />
            <p className="text-sm text-muted">Preparing</p>
            <p className="font-medium text-xs">Your order</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl space-y-2">
            <Calendar className="text-violet mx-auto" size={24} />
            <p className="text-sm text-muted">Scheduled</p>
            <p className="font-medium text-xs">For pickup</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl space-y-2">
            <Clock className="text-lav mx-auto" size={24} />
            <p className="text-sm text-muted">Confirmed</p>
            <p className="font-medium text-xs">On time</p>
          </div>
        </div>

        {/* Details */}
        <div className="text-left glass-panel p-6 rounded-2xl space-y-3 shadow-inner">
          <h3 className="font-display font-semibold text-lg gradient-text">
            What's Next?
          </h3>
          <ul className="space-y-2 text-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose mt-1">•</span>
              <span>You'll receive a confirmation email shortly with your order details.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose mt-1">•</span>
              <span>A WhatsApp confirmation will be sent to your registered number.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose mt-1">•</span>
              <span>Please arrive at the scheduled pickup time with your order ID.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose mt-1">•</span>
              <span>Contact us if you need to make any changes to your order.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/" className="flex-1">
            <Button variant="primary" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/book" className="flex-1">
            <Button variant="secondary" className="w-full">
              Book a Consultation
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <p className="text-muted">Loading...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
