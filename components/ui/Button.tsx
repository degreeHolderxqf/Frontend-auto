import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]",
          // Size
          size === "sm" && "px-3 py-1.5 text-xs gap-1.5",
          size === "md" && "px-4 py-2 text-sm gap-2",
          size === "lg" && "px-5 py-2.5 text-base gap-2.5",
          size === "icon" && "p-2 aspect-square",
          // Variant
          variant === "primary" &&
            "bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-sm hover:shadow-sky-500/20 shadow-transparent",
          variant === "secondary" &&
            "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80",
          variant === "outline" &&
            "bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700",
          variant === "danger" &&
            "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20",
          variant === "success" &&
            "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20",
          variant === "ghost" && "bg-transparent hover:bg-slate-800 text-slate-300",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
