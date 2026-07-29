import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { CategoryBreakdown } from "@/components/finance/CategoryBreakdown";
import { CategoryTrend } from "@/components/finance/CategoryTrend";
import { BalanceTrendChart } from "@/components/charts/BalanceTrendChart";
import { CategoryStackedBar } from "@/components/charts/CategoryStackedBar";
import { MiniColumnChart } from "@/components/charts/MiniColumnChart";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { CATEGORICAL, OTHER_SLOT } from "@/lib/chart-colors";
import { formatCurrency, formatCurrencyCompact, formatDate, todayLocalDate } from "@/lib/format";
import {
  currentFinancialMonthKey,
  financialMonthKey,
  financialMonthLabel,
  financialMonthRange,
  shiftFinancialMonthKey,
} from "@/lib/financial-month";

export const revalidate = 60;

const GRID_LINE_STEPS = 4;
const TREND_WINDOW_DAYS = 30;
const MONTHLY_CHART_COUNT = 6;

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lastMonths(count: number): { key: string; label: string }[] {
  const current = currentFinancialMonthKey();
  return Array.from({ length: count }, (_, i) => {
    const key = shiftFinancialMonthKey(current, -(count - 1 - i));
    return { key, label: financialMonthLabel(key) };
  });
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }, { data: categories }] = await Promise.all([
    supabase.from("finance_accounts").select("id, starting_balance"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, account_id, category_id"),
    supabase.from("finance_categories").select("id, name, icon"),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const monthKey = currentFinancialMonthKey();
  const { start: monthStart, end: monthEnd } = financialMonthRange(monthKey);
  const lastMonthKey = shiftFinancialMonthKey(monthKey, -1);
  const { start: lastMonthStart, end: lastMonthEnd } = financialMonthRange(lastMonthKey);

  const today = new Date(todayLocalDate() + "T00:00:00");
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const windowStartDate = new Date(today);
  windowStartDate.setDate(windowStartDate.getDate() - (TREND_WINDOW_DAYS - 1));
  const windowStart = isoDate(windowStartDate);

  const startingBalanceTotal = (accounts ?? []).reduce((sum, a) => sum + a.starting_balance, 0);
  let balanceBeforeWindow = startingBalanceTotal;
  const dayNet = new Map<string, number>();

  const categoryTotals: Record<string, number> = {};
  const lastMonthCategoryTotals: Record<string, number> = {};
  const ninetyDayTotals: Record<string, number> = {};
  const months = lastMonths(MONTHLY_CHART_COUNT);
  const monthTotals = new Map(months.map((m) => [m.key, { income: 0, expense: 0 }]));

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    if (tx.occurred_on < windowStart) balanceBeforeWindow += delta;
    else dayNet.set(tx.occurred_on, (dayNet.get(tx.occurred_on) ?? 0) + delta);

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

  const trendPoints: { date: string; balance: number; dateFormatted: string; balanceFormatted: string }[] = [];
  let running = balanceBeforeWindow;
  for (let i = 0; i < TREND_WINDOW_DAYS; i++) {
    const d = new Date(windowStartDate);
    d.setDate(d.getDate() + i);
    const dateStr = isoDate(d);
    running += dayNet.get(dateStr) ?? 0;
    trendPoints.push({ date: dateStr, balance: running, dateFormatted: formatDate(dateStr), balanceFormatted: formatCurrency(running) });
  }
  const trendMax = Math.max(...trendPoints.map((p) => p.balance), 0.01);
  const trendMin = Math.min(0, ...trendPoints.map((p) => p.balance));
  const balanceGridLines = Array.from({ length: GRID_LINE_STEPS + 1 }, (_, i) => {
    const value = trendMax - (i / GRID_LINE_STEPS) * (trendMax - trendMin);
    return { value, label: formatCurrencyCompact(value) };
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategories = sortedCategories.slice(0, CATEGORICAL.length - 1);
  const otherEntries = sortedCategories.slice(CATEGORICAL.length - 1);
  const otherTotal = otherEntries.reduce((sum, [, amt]) => sum + amt, 0);
  const categorySegments = topCategories.map(([id, amt], i) => ({
    categoryId: id,
    categoryIds: [id],
    name: categoriesById[id]?.name ?? "Uncategorized",
    icon: categoriesById[id]?.icon ?? "more-horizontal",
    amount: amt,
    amountFormatted: formatCurrency(amt),
    color: CATEGORICAL[i],
  }));
  if (otherTotal > 0) {
    categorySegments.push({
      categoryId: "other",
      categoryIds: otherEntries.map(([id]) => id),
      name: "Other",
      icon: "more-horizontal",
      amount: otherTotal,
      amountFormatted: formatCurrency(otherTotal),
      color: OTHER_SLOT,
    });
  }
  const monthExpenseTotal = sortedCategories.reduce((sum, [, amt]) => sum + amt, 0);

  const columnMax = Math.max(1, ...months.flatMap((m) => [monthTotals.get(m.key)?.income ?? 0, monthTotals.get(m.key)?.expense ?? 0]));
  const columnGridLines = [
    { value: columnMax, label: formatCurrency(columnMax) },
    { value: columnMax / 2, label: formatCurrency(columnMax / 2) },
    { value: 0, label: formatCurrency(0) },
  ];

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
        Balance — last 30 days
      </h2>
      <Card className="mb-6 px-2 py-4 sm:px-3">
        <BalanceTrendChart points={trendPoints} gridLines={balanceGridLines} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Spending by category — this month
      </h2>
      <Card className="mb-6">
        <CategoryStackedBar segments={categorySegments} total={monthExpenseTotal} backTo="analytics" />
      </Card>

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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Income vs. expenses</h2>
      <Card className="mb-6">
        <MiniColumnChart
          gridLines={columnGridLines}
          months={months.map((m) => {
            const income = monthTotals.get(m.key)?.income ?? 0;
            const expense = monthTotals.get(m.key)?.expense ?? 0;
            return {
              label: m.label,
              income,
              expense,
              incomeFormatted: formatCurrency(income),
              expenseFormatted: formatCurrency(expense),
            };
          })}
        />
      </Card>
    </div>
  );
}
