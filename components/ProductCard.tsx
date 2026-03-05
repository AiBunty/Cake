"use client";

import { motion } from "framer-motion";
import { Product, Topping, SelectedTopping } from "@/types";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { addToCart } from "@/lib/cart";
import { useState } from "react";
import ToppingsModal from "./ToppingsModal";

interface ProductCardProps {
  product: Product;
  allToppings: Topping[];
}

export default function ProductCard({ product, allToppings }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedToppings: SelectedTopping[]
  ) => {
    setIsAdding(true);
    addToCart(product, quantity, selectedToppings);
    
    // Dispatch custom event to update cart count
    window.dispatchEvent(new Event("cartUpdated"));
    
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleButtonClick = () => {
    // Check if product has allowed toppings configured
    const hasAllowedToppings = product.allowed_toppings && 
      product.allowed_toppings.trim().length > 0;
    
    if (hasAllowedToppings) {
      // Open modal for topping selection
      setShowModal(true);
    } else {
      // Add directly to cart without toppings
      handleAddToCart(product, 1, []);
    }
  };

  return (
    <>
      <Card hover glow className="overflow-hidden group">
        <div className="relative h-40 sm:h-52 mb-3 sm:mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-rose/5 to-violet/5">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <span className="text-red-400 font-semibold text-sm sm:text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div>
            <h3 className="text-base sm:text-xl font-display font-semibold text-text mb-1">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-lg sm:text-2xl font-bold gradient-text whitespace-nowrap">
              {formatCurrency(product.price_inr)}
            </span>
            <Button
              variant="primary"
              onClick={handleButtonClick}
              disabled={!product.is_available || isAdding}
              className="text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3"
            >
              {isAdding ? "Added!" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Card>

      <ToppingsModal
        product={product}
        allToppings={allToppings}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
