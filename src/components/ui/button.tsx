"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-[#0F0F0F] text-white hover:bg-[#1F1F1F] focus-visible:ring-[#0F0F0F]",
    outline: "border border-[#E5E7EB] bg-white text-[#0F0F0F] hover:bg-[#F3F4F6]",
    ghost:   "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0F0F0F]",
    danger:  "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
