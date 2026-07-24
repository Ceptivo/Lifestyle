import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "pink-soft";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-5 shadow-sm",
        tone === "paper" ? "bg-paper" : "bg-pink-soft border-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card className="overflow-hidden px-3 py-3.5 sm:px-4 sm:py-4">
      <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-charcoal-soft sm:text-[10px]">
        {label}
      </p>
      <p className="mt-1.5 truncate text-lg font-bold tabular-nums text-charcoal sm:text-2xl">{value}</p>
    </Card>
  );
}
