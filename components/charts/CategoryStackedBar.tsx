"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Segment = {
  categoryId: string;
  categoryIds: string[];
  name: string;
  icon: string;
  amount: number;
  amountFormatted: string;
  color: string;
};

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
            <Link
              key={s.categoryId}
              href={`/finance/transactions?category=${s.categoryIds.join(",")}`}
              className={cn(
                "block h-full transition-opacity",
                i > 0 && "border-l-2 border-paper",
                hovered && !isHovered && "opacity-50"
              )}
              style={{ width: `${pct}%`, backgroundColor: s.color }}
              onPointerEnter={() => setHovered(s.categoryId)}
              onPointerLeave={() => setHovered(null)}
              aria-label={`${s.name}: ${s.amountFormatted} — view transactions`}
            />
          );
        })}
      </div>

      <ul className="mt-4 space-y-2">
        {segments.map((s) => {
          const pct = (s.amount / total) * 100;
          const isHovered = hovered === s.categoryId;
          return (
            <li key={s.categoryId}>
              <Link
                href={`/finance/transactions?category=${s.categoryIds.join(",")}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors",
                  isHovered && "bg-cream"
                )}
                onPointerEnter={() => setHovered(s.categoryId)}
                onPointerLeave={() => setHovered(null)}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: s.color }}
                >
                  <Icon name={s.icon} size={13} />
                </span>
                <span className="min-w-0 flex-1 break-words text-sm text-charcoal">{s.name}</span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-charcoal">{s.amountFormatted}</span>
                  <span className="block text-xs text-charcoal-soft">{pct.toFixed(0)}%</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
