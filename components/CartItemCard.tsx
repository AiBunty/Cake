"use client";

import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { updateQuantity, removeFromCart } from "@/lib/cart";

interface CartItemCardProps {
  item: CartItem;
  onUpdate: () => void;
}

export default function CartItemCard({ item, onUpdate }: CartItemCardProps) {
  const handleIncrease = () => {
    updateQuantity(item.product.id, item.quantity + 1);
    onUpdate();
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1);
      onUpdate();
    }
  };

  const handleRemove = () => {
    removeFromCart(item.product.id);
    onUpdate();
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
              {formatCurrency(item.product.price_inr * item.quantity)}
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
