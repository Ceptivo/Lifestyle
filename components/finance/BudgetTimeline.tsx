"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type TimelineItem = {
  id: string;
  icon: string;
  name: string;
  dateLabel: string;
  amountFormatted: string;
  isIncome: boolean;
  runningFormatted: string;
};

export function BudgetTimeline({
  items,
  leftoverFormatted,
  leftoverPositive,
}: {
  items: TimelineItem[];
  leftoverFormatted: string;
  leftoverPositive: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-charcoal">Budgets</h1>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Set budget timeline"
          aria-expanded={open}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark hover:bg-pink-soft/70"
        >
          <BookOpen size={16} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-paper p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Set budget timeline"
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-charcoal">Set budget — by date</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 text-charcoal-soft hover:text-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                      <Icon name={item.icon} size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="text-xs text-charcoal-soft">{item.dateLabel}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-sm font-semibold tabular-nums", item.isIncome ? "text-emerald-600" : "text-danger")}>
                      {item.isIncome ? "+" : "-"}
                      {item.amountFormatted}
                    </p>
                    <p className="text-xs tabular-nums text-charcoal-soft">{item.runningFormatted}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-cream px-3 py-2.5">
              <p className="text-sm font-medium text-charcoal">Left over</p>
              <p className={cn("text-base font-bold tabular-nums", leftoverPositive ? "text-emerald-600" : "text-danger")}>
                {leftoverFormatted}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
