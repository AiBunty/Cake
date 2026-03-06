"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { markUpiVerified } from "@/lib/api";

export default function AdminUpiPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) {
      setError("Order ID is required");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await markUpiVerified(trimmed);

      if (!response.ok) {
        throw new Error(response.error || "Failed to verify UPI payment");
      }

      setMessage(`Order ${trimmed} marked as VERIFIED and PAID.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-6 space-y-5">
          <h1 className="text-2xl font-display font-semibold gradient-text">UPI Verification Admin</h1>
          <p className="text-sm text-muted">Enter order ID and mark UPI payment verified.</p>

          <Input
            label="Order ID"
            placeholder="ORD-XXXXXXXX"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />

          {message && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl p-3">
              {message}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </div>
          )}

          <Button type="button" variant="primary" isLoading={loading} disabled={loading} onClick={handleVerify} className="w-full">
            Verify UPI Payment
          </Button>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
