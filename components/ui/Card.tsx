"use client";

import { motion } from "framer-motion";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, glow = false, className = "", children, ...props }, ref) => {
    const baseStyles = "glass-panel p-3 sm:p-6";
    const hoverStyles = hover ? "card-lift cursor-pointer" : "";
    const glowStyles = glow ? "glow-border" : "";

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${baseStyles} ${hoverStyles} ${glowStyles} ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export default Card;
