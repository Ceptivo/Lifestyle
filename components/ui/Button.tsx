import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" && "bg-pink text-white hover:bg-pink-dark",
        variant === "secondary" && "bg-pink-soft text-pink-dark hover:bg-pink-soft/70",
        variant === "ghost" && "text-charcoal-soft hover:bg-cream",
        className
      )}
      {...props}
    />
  );
}
