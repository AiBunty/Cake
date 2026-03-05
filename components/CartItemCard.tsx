"use client";

import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { updateQuantityByIndex, removeFromCartByIndex } from "@/lib/cart";

interface CartItemCardProps {
  item: CartItem;
  itemIndex: number;
  onUpdate: () => void;
}

export default function CartItemCard({ item, itemIndex, onUpdate }: CartItemCardProps) {
  const handleIncrease = () => {
    updateQuantityByIndex(itemIndex, item.quantity + 1);
    onUpdate();
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantityByIndex(itemIndex, item.quantity - 1);
      onUpdate();
    }
  };

  const handleRemove = () => {
    removeFromCartByIndex(itemIndex);
    onUpdate();
  };

  // Calculate item total including toppings
  const calculateItemTotal = () => {
    let total = item.product.price_inr * item.quantity;
    
    if (item.selectedToppings && item.selectedToppings.length > 0) {
      const toppingsTotal = item.selectedToppings.reduce(
        (sum, selectedTopping) => 
          sum + (selectedTopping.topping.price_inr * selectedTopping.quantity * item.quantity),
        0
      );
      total += toppingsTotal;
    }
    
    return total;
  };

  return (
    <div className="glass-panel p-4 flex gap-4 rounded-2xl">
      <div className="relative h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose/10 to-violet/10">
        <Image
          src={item.product.image_url}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-semibold text-text">{item.product.name}</h4>
          <p className="text-sm text-muted">
            {formatCurrency(item.product.price_inr)} each
          </p>
          
          {/* Show selected toppings */}
          {item.selectedToppings && item.selectedToppings.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.selectedToppings.map((selectedTopping) => (
                <div 
                  key={selectedTopping.topping.id}
                  className="text-xs text-muted flex items-center gap-2"
                >
                  <span>{selectedTopping.topping.icon_emoji}</span>
                  <span>
                    {selectedTopping.topping.name} × {selectedTopping.quantity}
                  </span>
                  <span className="text-rose">
                    +{formatCurrency(selectedTopping.topping.price_inr * selectedTopping.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className="glass-panel p-2 rounded-xl hover:border-rose/60 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-semibold w-8 text-center">{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className="glass-panel p-2 rounded-xl hover:border-rose/60 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-bold text-lg">
              {formatCurrency(calculateItemTotal())}
            </span>
            <button
              onClick={handleRemove}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
