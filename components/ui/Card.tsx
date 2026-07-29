import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";

const TONE_CLASSES = {
  paper: "bg-paper",
  "pink-soft": "bg-pink-soft border-transparent",
  "danger-soft": "bg-danger-soft border-transparent",
};

export function Card({
  children,
  className,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof TONE_CLASSES;
}) {
  return (
    <div className={cn("rounded-3xl border border-border p-5", TONE_CLASSES[tone], className)}>{children}</div>
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
    <Card className="min-w-0 px-2.5 py-3 sm:px-4 sm:py-4">
      <p className="truncate text-[9px] font-semibold uppercase leading-tight tracking-wider text-charcoal-soft sm:text-[10px]">
        {label}
      </p>
      <p className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold leading-tight tabular-nums text-charcoal sm:text-2xl">
        {value}
      </p>
      {delta && Number.isFinite(delta.pct) && (
        <p
          className={cn(
            "mt-1 flex items-center gap-0.5 whitespace-nowrap text-[10px] font-semibold sm:text-xs",
            isGood ? "text-emerald-600" : "text-danger"
          )}
        >
          <DeltaIcon size={11} className="shrink-0" />
          {Math.abs(delta.pct).toFixed(0)}%
        </p>
      )}
    </Card>
  );
}
