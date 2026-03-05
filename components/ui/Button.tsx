"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gradientBorder";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading = false, className = "", children, ...props }, ref) => {
    const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-glow relative overflow-hidden";

    const variants = {
      primary: "bg-gradient-to-r from-rose via-violet to-lav text-white shadow-lg shadow-rose/20 hover:shadow-xl hover:shadow-rose/30 hover:-translate-y-0.5",
      secondary: "glass-panel border border-stroke text-text hover:border-rose/50 hover:shadow-lg hover:shadow-rose/10",
      ghost: "text-text hover:bg-panel/50 hover:text-rose",
      gradientBorder: "glow-border glass-panel text-text hover:-translate-y-0.5",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: variant === "primary" ? 1.01 : 1 }}
        whileTap={{ scale: 0.99 }}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2 justify-center">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
