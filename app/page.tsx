"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        if (response.ok && response.data) {
          const productList = response.data as Product[];
          setProducts(productList.sort((a, b) => a.sort_order - b.sort_order));
        } else {
          setError(response.error || "Failed to load products");
        }
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 glass-panel px-5 py-2.5 rounded-full text-sm text-muted mb-4 shadow-lg shadow-rose/10">
              <Sparkles size={16} className="text-rose" />
              <span>Freshly Baked Daily</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-display font-semibold tracking-tight leading-tight">
              <span className="gradient-text">Crafted with Love,</span>
              <br />
              <span className="text-text">Delivered with Care</span>
            </h1>

            <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              Discover our exquisite collection of handcrafted artisan cakes. Order now
              for same-day pickup or book a consultation to create your dream cake.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button variant="primary" className="group text-lg px-8 py-4">
                <span>Order Now</span>
                <ChevronRight
                  size={20}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
              <Link href="/book">
                <Button variant="gradientBorder" className="text-lg px-8 py-4">Book a Consultation</Button>
              </Link>
            </div>
          </motion.div>
        </div>
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
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
