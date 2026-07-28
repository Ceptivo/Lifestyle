import { createClient } from "@/lib/supabase/server";
import { CategoryBreakdown } from "@/components/finance/CategoryBreakdown";
import { CategoryTrend } from "@/components/finance/CategoryTrend";
import { MonthlyTrend } from "@/components/finance/MonthlyTrend";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { todayLocalDate } from "@/lib/format";
import {
  currentFinancialMonthKey,
  financialMonthKey,
  financialMonthLabel,
  financialMonthRange,
  shiftFinancialMonthKey,
} from "@/lib/financial-month";

export const revalidate = 60;

function lastMonths(count: number): { key: string; label: string }[] {
  const current = currentFinancialMonthKey();
  return Array.from({ length: count }, (_, i) => {
    const key = shiftFinancialMonthKey(current, -(count - 1 - i));
    return { key, label: financialMonthLabel(key) };
  });
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase.from("finance_transactions").select("type, amount, category_id, occurred_on"),
    supabase.from("finance_categories").select("id, name, icon"),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const monthKey = currentFinancialMonthKey();
  const { start: monthStart, end: monthEnd } = financialMonthRange(monthKey);
  const lastMonthKey = shiftFinancialMonthKey(monthKey, -1);
  const { start: lastMonthStart, end: lastMonthEnd } = financialMonthRange(lastMonthKey);

  const today = new Date(todayLocalDate() + "T00:00:00");
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const categoryTotals: Record<string, number> = {};
  const lastMonthCategoryTotals: Record<string, number> = {};
  const ninetyDayTotals: Record<string, number> = {};
  const months = lastMonths(6);
  const monthTotals = new Map(months.map((m) => [m.key, { income: 0, expense: 0 }]));

  for (const tx of transactions ?? []) {
    if (tx.type === "expense") {
      if (tx.occurred_on >= monthStart && tx.occurred_on <= monthEnd) {
        categoryTotals[tx.category_id] = (categoryTotals[tx.category_id] ?? 0) + tx.amount;
      }
      if (tx.occurred_on >= lastMonthStart && tx.occurred_on <= lastMonthEnd) {
        lastMonthCategoryTotals[tx.category_id] = (lastMonthCategoryTotals[tx.category_id] ?? 0) + tx.amount;
      }
      if (tx.occurred_on >= ninetyDaysAgo) {
        ninetyDayTotals[tx.category_id] = (ninetyDayTotals[tx.category_id] ?? 0) + tx.amount;
      }
    }

    const bucket = monthTotals.get(financialMonthKey(tx.occurred_on));
    if (bucket) {
      if (tx.type === "income") bucket.income += tx.amount;
      else bucket.expense += tx.amount;
    }
  }

  const trendCategoryIds = new Set([...Object.keys(categoryTotals), ...Object.keys(lastMonthCategoryTotals)]);
  const trendEntries = [...trendCategoryIds].map((categoryId) => ({
    categoryId,
    thisMonth: categoryTotals[categoryId] ?? 0,
    lastMonth: lastMonthCategoryTotals[categoryId] ?? 0,
  }));

  const top5NinetyDay = Object.fromEntries(
    Object.entries(ninetyDayTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  );

  return (
    <div>
      <FinanceBackLink />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Analytics</h1>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Spending by category — this month
      </h2>
      <div className="mb-6">
        <CategoryBreakdown totals={categoryTotals} categoriesById={categoriesById} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        This month vs. last month
      </h2>
      <div className="mb-6">
        <CategoryTrend entries={trendEntries} categoriesById={categoriesById} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Top categories — last 90 days
      </h2>
      <div className="mb-6">
        <CategoryBreakdown
          totals={top5NinetyDay}
          categoriesById={categoriesById}
          emptyMessage="No expenses logged in the last 90 days yet."
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Last 6 months</h2>
      <MonthlyTrend
        months={months.map((m) => ({
          label: m.label,
          income: monthTotals.get(m.key)?.income ?? 0,
          expense: monthTotals.get(m.key)?.expense ?? 0,
        }))}
      />
    </div>
  );
}
