"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-medium text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            glass-panel px-4 py-3 rounded-2xl
            bg-panel/50 border border-stroke
            text-text placeholder:text-muted/60
            focus:outline-none focus:border-rose/60 focus:ring-2 focus:ring-rose/20
            transition-all duration-300
            ${error ? "border-red-400/60" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
