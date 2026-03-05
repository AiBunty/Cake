"use client";

import { motion } from "framer-motion";
import { Product } from "@/types";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { addToCart } from "@/lib/cart";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, 1);
    
    // Dispatch custom event to update cart count
    window.dispatchEvent(new Event("cartUpdated"));
    
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <Card hover glow className="overflow-hidden group">
      <div className="relative h-52 mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-rose/5 to-violet/5">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-red-400 font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-display font-semibold text-text mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold gradient-text">
            {formatCurrency(product.price_inr)}
          </span>
          <Button
            variant="primary"
            onClick={handleAddToCart}
            disabled={!product.is_available || isAdding}
            className="text-sm"
          >
            {isAdding ? "Added!" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
