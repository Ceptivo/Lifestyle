import { Card } from "@/components/ui/Card";
import { CATEGORY_ICON, CATEGORY_LABEL } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import type { FinanceCategory } from "@/lib/types";

export function CategoryBreakdown({ totals }: { totals: Partial<Record<FinanceCategory, number>> }) {
  const sorted = (Object.entries(totals) as [FinanceCategory, number][])
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!sorted.length) {
    return <p className="text-center text-sm text-charcoal-soft">No expenses logged this month yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {sorted.map(([category, total]) => {
        const Icon = CATEGORY_ICON[category];
        return (
          <Card key={category} className="px-4 py-3">
            <Icon size={16} className="mb-2 text-pink" />
            <p className="text-lg font-bold text-charcoal">{formatCurrency(total)}</p>
            <p className="text-xs text-charcoal-soft">{CATEGORY_LABEL[category]}</p>
          </Card>
        );
      })}
    </div>
  );
}
