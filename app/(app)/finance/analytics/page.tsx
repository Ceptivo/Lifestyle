import { createClient } from "@/lib/supabase/server";
import { CategoryBreakdown } from "@/components/finance/CategoryBreakdown";
import { CategoryTrend } from "@/components/finance/CategoryTrend";
import { MonthlyTrend } from "@/components/finance/MonthlyTrend";
import { todayLocalDate } from "@/lib/format";

export const revalidate = 60;

function lastMonths(count: number): { key: string; label: string }[] {
  const today = new Date(todayLocalDate() + "T00:00:00");
  const result: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    result.push({ key, label });
  }
  return result;
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase.from("finance_transactions").select("type, amount, category_id, occurred_on"),
    supabase.from("finance_categories").select("id, name, icon"),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const monthPrefix = todayLocalDate().slice(0, 7);

  const today = new Date(todayLocalDate() + "T00:00:00");
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const categoryTotals: Record<string, number> = {};
  const lastMonthCategoryTotals: Record<string, number> = {};
  const ninetyDayTotals: Record<string, number> = {};
  const months = lastMonths(6);
  const monthTotals = new Map(months.map((m) => [m.key, { income: 0, expense: 0 }]));

  for (const tx of transactions ?? []) {
    if (tx.type === "expense") {
      if (tx.occurred_on.startsWith(monthPrefix)) {
        categoryTotals[tx.category_id] = (categoryTotals[tx.category_id] ?? 0) + tx.amount;
      }
      if (tx.occurred_on.startsWith(lastMonthPrefix)) {
        lastMonthCategoryTotals[tx.category_id] = (lastMonthCategoryTotals[tx.category_id] ?? 0) + tx.amount;
      }
      if (tx.occurred_on >= ninetyDaysAgo) {
        ninetyDayTotals[tx.category_id] = (ninetyDayTotals[tx.category_id] ?? 0) + tx.amount;
      }
    }

    const txMonth = tx.occurred_on.slice(0, 7);
    const bucket = monthTotals.get(txMonth);
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
