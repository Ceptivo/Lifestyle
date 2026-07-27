"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Segment = { categoryId: string; name: string; icon: string; amount: number; amountFormatted: string; color: string };

export function CategoryStackedBar({ segments, total }: { segments: Segment[]; total: number }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (!segments.length || total <= 0) {
    return <p className="text-center text-sm text-charcoal-soft">No expenses logged this month yet.</p>;
  }

  return (
    <div>
      <div className="flex h-7 w-full overflow-hidden rounded-full bg-cream">
        {segments.map((s, i) => {
          const pct = (s.amount / total) * 100;
          const isHovered = hovered === s.categoryId;
          return (
            <button
              key={s.categoryId}
              type="button"
              className={cn(
                "h-full transition-opacity",
                i > 0 && "border-l-2 border-paper",
                hovered && !isHovered && "opacity-50"
              )}
              style={{ width: `${pct}%`, backgroundColor: s.color }}
              onPointerEnter={() => setHovered(s.categoryId)}
              onPointerLeave={() => setHovered(null)}
              aria-label={`${s.name}: ${s.amountFormatted}`}
            />
          );
        })}
      </div>

      <ul className="mt-4 space-y-2">
        {segments.map((s) => {
          const pct = (s.amount / total) * 100;
          const isHovered = hovered === s.categoryId;
          return (
            <li
              key={s.categoryId}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors",
                isHovered && "bg-cream"
              )}
              onPointerEnter={() => setHovered(s.categoryId)}
              onPointerLeave={() => setHovered(null)}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: s.color }}
              >
                <Icon name={s.icon} size={12} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-charcoal">{s.name}</span>
              <span className="shrink-0 text-xs text-charcoal-soft">{pct.toFixed(0)}%</span>
              <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-charcoal">
                {s.amountFormatted}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
