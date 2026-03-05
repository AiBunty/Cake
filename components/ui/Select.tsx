"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-medium text-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            glass-panel px-4 py-3 rounded-2xl
            bg-panel/50 border border-stroke
            text-text
            focus:outline-none focus:border-rose/60 focus:ring-2 focus:ring-rose/20
            transition-all duration-300
            cursor-pointer
            ${error ? "border-red-400/60" : ""}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        {error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
