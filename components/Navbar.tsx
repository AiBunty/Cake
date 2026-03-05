"use client";

import Link from "next/link";
import { ShoppingCart, CalendarCheck, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";
import { motion } from "framer-motion";
import { useSettings } from "@/app/SettingsContext";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const { settings } = useSettings();

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-panel sticky top-0 z-50 border-b border-stroke shadow-lg shadow-black/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-display font-bold gradient-text">
              {settings?.company_name || 'Cake Studio'}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-text hover:text-rose transition-colors font-medium"
            >
              Menu
            </Link>

            <Link
              href="/book"
              className="flex items-center gap-2 text-text hover:text-rose transition-colors font-medium"
            >
              <CalendarCheck size={20} />
              <span className="hidden sm:inline">Book a Slot</span>
            </Link>

            <Link
              href="/track-orders"
              className="flex items-center gap-2 text-text hover:text-rose transition-colors font-medium"
            >
              <Package size={20} />
              <span className="hidden sm:inline">Track Orders</span>
            </Link>

            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-rose transition-colors font-medium"
                title="Follow on Instagram"
              >
                📷
              </a>
            )}

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-text hover:text-rose transition-colors font-medium"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-rose to-violet text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-rose/30"
                >
                  {cartCount}
                </motion.span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
