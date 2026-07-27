import { Trash2 } from "lucide-react";
import { deleteBudget } from "@/app/actions/finance-budgets";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

type Budget = { id: string; categoryId: string; monthlyLimit: number; spent: number };
type LookupEntry = { name: string; icon: string };

export function BudgetList({
  budgets,
  categoriesById,
}: {
  budgets: Budget[];
  categoriesById: Record<string, LookupEntry>;
}) {
  if (!budgets.length) {
    return <p className="text-center text-sm text-charcoal-soft">No budgets yet. Add one to track a category.</p>;
  }

  return (
    <ul className="space-y-2">
      {budgets.map((budget) => {
        const category = categoriesById[budget.categoryId];
        const pct = Math.min(100, (budget.spent / budget.monthlyLimit) * 100);
        const over = budget.spent > budget.monthlyLimit;
        return (
          <li key={budget.id}>
            <Card className="px-4 py-3.5">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Icon name={category?.icon ?? "more-horizontal"} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-charcoal">{category?.name ?? "Uncategorized"}</p>
                  <p className={cn("text-xs", over ? "text-pink-dark" : "text-charcoal-soft")}>
                    {formatCurrency(budget.spent)} of {formatCurrency(budget.monthlyLimit)}
                  </p>
                </div>
                <form action={deleteBudget.bind(null, budget.id)}>
                  <button
                    type="submit"
                    aria-label="Delete budget"
                    className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-pink"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-cream">
                <div
                  className={cn("h-full rounded-full", over ? "bg-pink-dark" : "bg-pink")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
