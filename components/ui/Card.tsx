import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
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

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: ReactNode;
  delta?: { pct: number; goodDirection: "up" | "down" };
}) {
  const isGood = delta && (delta.goodDirection === "up" ? delta.pct >= 0 : delta.pct <= 0);
  const DeltaIcon = delta && delta.pct >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="overflow-hidden px-3 py-3.5 sm:px-4 sm:py-4">
      <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-charcoal-soft sm:text-[10px]">
        {label}
      </p>
      <p className="mt-1.5 truncate text-lg font-bold text-charcoal sm:text-2xl">{value}</p>
      {delta && Number.isFinite(delta.pct) && (
        <p
          className={cn(
            "mt-1 flex items-center gap-0.5 text-[10px] font-semibold sm:text-xs",
            isGood ? "text-emerald-600" : "text-pink-dark"
          )}
        >
          <DeltaIcon size={11} />
          {Math.abs(delta.pct).toFixed(0)}% vs last month
        </p>
      )}
    </Card>
  );
}
