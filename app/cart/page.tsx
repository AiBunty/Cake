"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCart } from "@/lib/cart";
import { Cart as CartType } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItemCard from "@/components/CartItemCard";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<CartType>({ items: [], total: 0 });

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleUpdate = () => {
    setCart(getCart());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-block glass-panel p-6 rounded-full mb-4 shadow-lg shadow-rose/10">
              <ShoppingBag size={48} className="text-muted" />
            </div>
            <h1 className="text-4xl font-display font-semibold">Your cart is empty</h1>
            <p className="text-muted text-lg">
              Add some delicious cakes to get started!
            </p>
            <Link href="/">
              <Button variant="primary">Browse Menu</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
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
              Your <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-muted">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <CartItemCard item={item} onUpdate={handleUpdate} />
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="glass-panel glow-border p-6 space-y-6 sticky top-24 shadow-xl shadow-rose/10">
                <h2 className="text-2xl font-display font-semibold">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Taxes & Fees</span>
                    <span>Calculated at checkout</span>
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

                <Link href="/checkout" className="block">
                  <Button variant="primary" className="w-full group text-lg py-4">
                    <span>Proceed to Checkout</span>
                    <ArrowRight
                      size={20}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
