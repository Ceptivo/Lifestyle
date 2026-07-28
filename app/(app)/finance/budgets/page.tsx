import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { BudgetForm } from "@/components/finance/BudgetForm";
import { BudgetList } from "@/components/finance/BudgetList";
import { BudgetPlanNotes } from "@/components/finance/BudgetPlanNotes";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { currentFinancialMonthKey, financialMonthRange } from "@/lib/financial-month";

export const revalidate = 60;

const NOTES_ID = "00000000-0000-0000-0000-000000000001";

export default async function BudgetsPage() {
  const supabase = createClient();
  const [{ data: budgets }, { data: categories }, { data: transactions }, { data: notes }] = await Promise.all([
    supabase.from("finance_budgets").select("id, category_id, monthly_limit"),
    supabase.from("finance_categories").select("id, name, icon, type"),
    supabase.from("finance_transactions").select("type, amount, category_id, occurred_on"),
    supabase.from("finance_budget_notes").select("content").eq("id", NOTES_ID).maybeSingle(),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const { start: monthStart, end: monthEnd } = financialMonthRange(currentFinancialMonthKey());

  const spentByCategory: Record<string, number> = {};
  for (const tx of transactions ?? []) {
    if (tx.type === "expense" && tx.occurred_on >= monthStart && tx.occurred_on <= monthEnd) {
      spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] ?? 0) + tx.amount;
    }
  }

  const budgetedCategoryIds = new Set((budgets ?? []).map((b) => b.category_id));
  const availableCategories = (categories ?? []).filter(
    (c) => c.type === "expense" && !budgetedCategoryIds.has(c.id)
  );

  const totalBudgeted = (budgets ?? []).reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = (budgets ?? []).reduce((sum, b) => sum + (spentByCategory[b.category_id] ?? 0), 0);
  const totalPct = totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0;
  const overBudget = totalSpent > totalBudgeted && totalBudgeted > 0;

  return (
    <div>
      <FinanceBackLink />
      <BudgetPlanNotes initialContent={notes?.content ?? ""} />

      {totalBudgeted > 0 && (
        <Card className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-charcoal-soft">
              Spend: <span className="font-semibold text-charcoal">{formatCurrency(totalSpent)}</span> /{" "}
              {formatCurrency(totalBudgeted)}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                overBudget ? "bg-danger-soft text-danger" : "bg-pink-soft text-pink-dark"
              )}
            >
              {((totalSpent / totalBudgeted) * 100 || 0).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-cream">
            <div
              className={cn("h-full rounded-full", overBudget ? "bg-danger" : "bg-pink")}
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </Card>
      )}

      <div className="mb-6">
        <BudgetForm categories={availableCategories} />
      </div>

      <BudgetList
        budgets={(budgets ?? []).map((b) => ({
          id: b.id,
          categoryId: b.category_id,
          monthlyLimit: b.monthly_limit,
          spent: spentByCategory[b.category_id] ?? 0,
        }))}
        categoriesById={categoriesById}
      />
    </div>
  );
}
