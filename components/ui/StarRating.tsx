"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function StarRatingInput({ name, defaultValue }: { name: string; defaultValue?: number | null }) {
  const [value, setValue] = useState(defaultValue ?? 0);

  return (
    <div>
      <input type="hidden" name={name} value={value || ""} />
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n === value ? 0 : n)}
            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <Star size={20} className={cn(n <= value ? "fill-pink text-pink" : "text-charcoal-soft")} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function StarRatingDisplay({ rating, size = 12 }: { rating: number | null; size?: number }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={cn(n <= rating ? "fill-pink text-pink" : "text-charcoal-soft")} />
      ))}
    </div>
  );
}
