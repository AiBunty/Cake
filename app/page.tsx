"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Product, Topping } from "@/types";
import { getProducts, getToppings } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { Sparkles, ChevronRight, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, toppingsResponse] = await Promise.all([
          getProducts(),
          getToppings()
        ]);
        
        if (productsResponse.ok && productsResponse.data) {
          const productList = productsResponse.data as Product[];
          setProducts(productList.sort((a, b) => a.sort_order - b.sort_order));
        } else {
          setError(productsResponse.error || "Failed to load products");
        }
        
        if (toppingsResponse.ok && toppingsResponse.data) {
          const toppingList = toppingsResponse.data as Topping[];
          setToppings(toppingList.sort((a, b) => a.sort_order - b.sort_order));
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Full Width Video Background */}
      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-[var(--bg)]">
        {/* Video Background - Full Width */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="relative w-full h-full">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/uMAbWsMnKYk?start=20&autoplay=1&mute=${
                isSoundOn ? 0 : 1
              }&controls=0&rel=0&modestbranding=1&loop=1&playlist=uMAbWsMnKYk&playsinline=1&enablejsapi=0`}
              title="Cake Studio - Premium Artisan Cakes"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full object-cover"
            ></iframe>
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          </div>
        </div>

        {/* Content - Centered */}
        <div className="relative z-10 px-4 py-16 sm:py-24 w-full">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 glass-panel px-5 py-2.5 rounded-full text-sm text-white mb-4 shadow-lg shadow-rose/10">
                <Sparkles size={16} className="text-rose" />
                <span>Freshly Baked Daily</span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-display font-semibold tracking-tight leading-tight text-white drop-shadow-lg">
                <span className="text-rose">Crafted with Love,</span>
                <br />
                <span className="text-white">Delivered with Care</span>
              </h1>

              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                Discover our exquisite collection of handcrafted artisan cakes. Order now
                for same-day pickup or book a consultation to create your dream cake.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 sm:items-stretch">
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="primary" className="group text-lg px-8 py-4 w-full sm:w-auto h-full flex items-center justify-center gap-2">
                    <span>Order Now</span>
                    <ChevronRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
                <Link href="/book" className="w-full sm:w-auto">
                  <Button variant="gradientBorder" className="text-lg px-8 py-4 w-full sm:w-auto h-full flex items-center justify-center">
                    Book a Consultation
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sound Toggle Button - Fixed Position */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => setIsSoundOn(!isSoundOn)}
          className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all group"
          title={isSoundOn ? "Mute" : "Unmute"}
        >
          {isSoundOn ? (
            <Volume2 size={24} className="text-white group-hover:text-rose transition-colors" />
          ) : (
            <VolumeX size={24} className="text-white group-hover:text-rose transition-colors" />
          )}
        </motion.button>
      </section>

      {/* Products Section */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-4xl sm:text-5xl font-display font-semibold mb-4 text-center">
              Our <span className="gradient-text">Menu</span>
            </h2>
            <p className="text-center text-muted mb-12 max-w-2xl mx-auto">
              Freshly baked. Perfectly packed. Ready for pickup.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "primary" : "secondary"}
                  onClick={() => setSelectedCategory(category)}
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rose border-t-transparent"></div>
                <p className="mt-4 text-muted">Loading delicious cakes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted">No products available</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} allToppings={toppings} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
