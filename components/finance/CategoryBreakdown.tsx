import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";

type LookupEntry = { name: string; icon: string };

export function CategoryBreakdown({
  totals,
  categoriesById,
  emptyMessage = "No expenses logged this month yet.",
}: {
  totals: Record<string, number>;
  categoriesById: Record<string, LookupEntry>;
  emptyMessage?: string;
}) {
  const sorted = Object.entries(totals)
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!sorted.length) {
    return <p className="text-center text-sm text-charcoal-soft">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {sorted.map(([categoryId, total]) => {
        const category = categoriesById[categoryId];
        return (
          <Link key={categoryId} href={`/finance/transactions?category=${categoryId}`}>
            <Card className="px-4 py-3">
              <Icon name={category?.icon ?? "more-horizontal"} size={16} className="mb-2 text-pink" />
              <p className="text-lg font-bold text-charcoal">{formatCurrency(total)}</p>
              <p className="text-xs text-charcoal-soft">{category?.name ?? "Uncategorized"}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
