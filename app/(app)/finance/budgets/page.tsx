import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { BudgetForm } from "@/components/finance/BudgetForm";
import { BudgetList } from "@/components/finance/BudgetList";
import { BudgetTimeline } from "@/components/finance/BudgetTimeline";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { currentFinancialMonthKey, financialMonthRange, occurrenceInMonth } from "@/lib/financial-month";

export const revalidate = 60;

// No recurring-income table exists yet — this is the expected monthly
// salary, used only to build the "set budget" timeline below.
const EXPECTED_MONTHLY_INCOME = 10000;
const INCOME_DAY_OF_MONTH = 24;

function shortDateLabel(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function BudgetsPage() {
  const supabase = createClient();
  const [{ data: budgets }, { data: categories }, { data: transactions }, { data: subscriptions }] = await Promise.all([
    supabase.from("finance_budgets").select("id, category_id, monthly_limit"),
    supabase.from("finance_categories").select("id, name, icon, type"),
    supabase.from("finance_transactions").select("type, amount, category_id, occurred_on"),
    supabase
      .from("finance_subscriptions")
      .select("id, name, icon, amount, category_id, next_due_date, status")
      .eq("status", "active"),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const monthKey = currentFinancialMonthKey();
  const { start: monthStart, end: monthEnd } = financialMonthRange(monthKey);

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

  // --- "Set budget" timeline: every recurring item in date order, plus a
  // running leftover total. Dated items come from active Subscriptions;
  // budget categories with no linked subscription (variable, undated
  // spend like Groceries or Petrol) are appended at the end.
  const subscriptionCategoryIds = new Set((subscriptions ?? []).map((s) => s.category_id));
  const undatedBudgets = (budgets ?? [])
    .filter((b) => !subscriptionCategoryIds.has(b.category_id))
    .sort((a, b) => (categoriesById[a.category_id]?.name ?? "").localeCompare(categoriesById[b.category_id]?.name ?? ""));

  type RawItem = { id: string; icon: string; name: string; date: string | null; amount: number; isIncome: boolean };

  const dated: RawItem[] = (subscriptions ?? []).map((s) => {
    const dayOfMonth = Number(s.next_due_date.slice(8, 10));
    return {
      id: s.id,
      icon: s.icon,
      name: s.name,
      date: occurrenceInMonth(dayOfMonth, monthKey),
      amount: s.amount,
      isIncome: false,
    };
  });
  dated.push({
    id: "income",
    icon: "wallet",
    name: "Monthly income",
    date: occurrenceInMonth(INCOME_DAY_OF_MONTH, monthKey),
    amount: EXPECTED_MONTHLY_INCOME,
    isIncome: true,
  });
  dated.sort((a, b) => {
    if (a.date !== b.date) return a.date! < b.date! ? -1 : 1;
    // Income lands before same-day deductions — e.g. SARS Tax is taken
    // immediately after the salary that funds it, not before.
    if (a.isIncome !== b.isIncome) return a.isIncome ? -1 : 1;
    return 0;
  });

  const undated: RawItem[] = undatedBudgets.map((b) => ({
    id: b.id,
    icon: categoriesById[b.category_id]?.icon ?? "more-horizontal",
    name: categoriesById[b.category_id]?.name ?? "Uncategorized",
    date: null,
    amount: b.monthly_limit,
    isIncome: false,
  }));

  let running = 0;
  const timelineItems = [...dated, ...undated].map((item) => {
    running += item.isIncome ? item.amount : -item.amount;
    return {
      id: item.id,
      icon: item.icon,
      name: item.name,
      dateLabel: item.date ? shortDateLabel(item.date) : "No fixed date",
      amountFormatted: formatCurrency(item.amount),
      isIncome: item.isIncome,
      runningFormatted: formatCurrency(running),
    };
  });

  return (
    <div>
      <FinanceBackLink />
      <BudgetTimeline items={timelineItems} leftoverFormatted={formatCurrency(running)} leftoverPositive={running >= 0} />

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
