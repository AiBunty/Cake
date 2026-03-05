"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Topping, SelectedTopping } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Button from "./ui/Button";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface ToppingsModalProps {
  product: Product;
  allToppings: Topping[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedToppings: SelectedTopping[]) => void;
}

export default function ToppingsModal({
  product,
  allToppings,
  isOpen,
  onClose,
  onAddToCart,
}: ToppingsModalProps) {
  const [productQuantity, setProductQuantity] = useState(1);
  const [toppingQuantities, setToppingQuantities] = useState<Record<string, number>>({});

  // Filter toppings based on product's allowed_toppings
  const allowedToppings = allToppings.filter((topping) => {
    if (!product.allowed_toppings || !topping.is_available) return false;
    
    // Split by space/comma/semicolon/pipe and normalize
    const allowedIds = product.allowed_toppings
      .split(/[\s,;|]+/)
      .map(id => id.trim().toLowerCase())
      .filter(id => id.length > 0);
    
    return allowedIds.includes(topping.id.toLowerCase());
  });

  // Debug logging
  console.log('🔍 Toppings Modal Debug:', {
    productName: product.name,
    productAllowedToppings: product.allowed_toppings,
    allToppingsCount: allToppings.length,
    allToppingsIds: allToppings.map(t => t.id),
    allowedToppingsCount: allowedToppings.length,
    allowedToppingsIds: allowedToppings.map(t => t.id)
  });

  // Calculate total price
  const calculateTotal = () => {
    let total = product.price_inr * productQuantity;
    
    Object.entries(toppingQuantities).forEach(([toppingId, qty]) => {
      const topping = allToppings.find(t => t.id === toppingId);
      if (topping && qty > 0) {
        total += topping.price_inr * qty * productQuantity; // Multiply by product quantity
      }
    });
    
    return total;
  };

  const updateToppingQuantity = (toppingId: string, delta: number) => {
    setToppingQuantities(prev => {
      const current = prev[toppingId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [toppingId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [toppingId]: newQty };
    });
  };

  const handleAddToCart = () => {
    const selectedToppings: SelectedTopping[] = Object.entries(toppingQuantities)
      .map(([toppingId, quantity]) => {
        const topping = allToppings.find(t => t.id === toppingId);
        if (topping && quantity > 0) {
          return { topping, quantity };
        }
        return null;
      })
      .filter((item): item is SelectedTopping => item !== null);

    onAddToCart(product, productQuantity, selectedToppings);
    onClose();
    
    // Reset state
    setProductQuantity(1);
    setToppingQuantities({});
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-hidden pointer-events-auto flex flex-col my-auto"
            >
              {/* Header */}
              <div className="border-b border-white/10 p-4 sm:p-6 flex items-start justify-between flex-shrink-0">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-display font-bold gradient-text mb-1 sm:mb-2">
                    Customize Your Order
                  </h2>
                  <p className="text-muted text-xs sm:text-sm">
                    {product.name} • {formatCurrency(product.price_inr)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-text transition-colors p-2 hover:bg-white/5 rounded-lg flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
                {/* Product Info */}
                <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-rose/5 to-violet/5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text text-sm sm:text-base mb-1">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-muted line-clamp-2">{product.description}</p>
                  </div>
                </div>

                {/* Product Quantity */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-text block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                      className="p-2"
                    >
                      <Minus size={18} />
                    </Button>
                    <span className="text-xl font-bold text-text min-w-[3rem] text-center">
                      {productQuantity}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => setProductQuantity(productQuantity + 1)}
                      className="p-2"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </div>

                {/* Toppings Selection */}
                {allowedToppings.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-text block mb-1">
                        Add Toppings (Optional)
                      </label>
                      <p className="text-xs text-muted">
                        Topping quantities apply per cake
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {allowedToppings.map((topping) => {
                        const qty = toppingQuantities[topping.id] || 0;
                        
                        return (
                          <div
                            key={topping.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              qty > 0
                                ? "border-rose/50 bg-gradient-to-br from-rose/10 to-violet/10"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-xl sm:text-2xl">{topping.icon_emoji}</span>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-text flex items-center gap-2 text-sm sm:text-base">
                                    {topping.name}
                                    <span className="text-xs sm:text-sm text-rose font-normal">
                                      +{formatCurrency(topping.price_inr)}
                                    </span>
                                  </h4>
                                  <p className="text-xs text-muted line-clamp-1">{topping.description}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => updateToppingQuantity(topping.id, -1)}
                                disabled={qty === 0}
                                className="p-2"
                              >
                                <Minus size={16} />
                              </Button>
                              <span className="text-sm font-semibold text-text min-w-[2rem] text-center">
                                {qty}
                              </span>
                              <Button
                                variant="secondary"
                                onClick={() => updateToppingQuantity(topping.id, 1)}
                                className="p-2"
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted">
                    <p>No toppings available for this product</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-4 sm:p-6 space-y-3 flex-shrink-0">
                <div className="flex items-center justify-between text-sm sm:text-lg">
                  <span className="font-semibold text-text">Total</span>
                  <span className="text-lg sm:text-2xl font-bold gradient-text">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
                
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  className="w-full py-3 sm:py-4 text-sm sm:text-base group"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  <span>Add to Cart</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
