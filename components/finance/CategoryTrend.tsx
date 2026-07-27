import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

type LookupEntry = { name: string; icon: string };
type TrendEntry = { categoryId: string; thisMonth: number; lastMonth: number };

export function CategoryTrend({
  entries,
  categoriesById,
}: {
  entries: TrendEntry[];
  categoriesById: Record<string, LookupEntry>;
}) {
  const sorted = entries
    .filter((e) => e.thisMonth > 0 || e.lastMonth > 0)
    .sort((a, b) => b.thisMonth - a.thisMonth);

  if (!sorted.length) {
    return <p className="text-center text-sm text-charcoal-soft">Not enough data yet.</p>;
  }

  return (
    <Card className="space-y-3">
      {sorted.map((entry) => {
        const category = categoriesById[entry.categoryId];
        const delta = entry.thisMonth - entry.lastMonth;
        const pct = entry.lastMonth > 0 ? (delta / entry.lastMonth) * 100 : entry.thisMonth > 0 ? 100 : 0;
        const Trend = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
        const trendColor = delta > 0 ? "text-danger" : delta < 0 ? "text-emerald-600" : "text-charcoal-soft";

        return (
          <div key={entry.categoryId} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={category?.icon ?? "more-horizontal"} size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal">{category?.name ?? "Uncategorized"}</p>
              <p className="text-xs text-charcoal-soft">
                {formatCurrency(entry.thisMonth)} this month · {formatCurrency(entry.lastMonth)} last month
              </p>
            </div>
            <div className={cn("flex shrink-0 items-center gap-1 text-xs font-semibold", trendColor)}>
              <Trend size={14} />
              {Math.abs(pct).toFixed(0)}%
            </div>
          </div>
        );
      })}
    </Card>
  );
}
