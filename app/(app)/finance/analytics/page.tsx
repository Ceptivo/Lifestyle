import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { CategoryBreakdown } from "@/components/finance/CategoryBreakdown";
import { CategoryTrend } from "@/components/finance/CategoryTrend";
import { BalanceTrendChart } from "@/components/charts/BalanceTrendChart";
import { CategoryStackedBar } from "@/components/charts/CategoryStackedBar";
import { MiniColumnChart } from "@/components/charts/MiniColumnChart";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { FinanceMenuDrawer } from "@/components/finance/FinanceMenuDrawer";
import { AccountList } from "@/components/finance/AccountList";
import { CATEGORICAL, OTHER_SLOT } from "@/lib/chart-colors";
import { formatCurrency, formatCurrencyCompact, formatDate, todayLocalDate } from "@/lib/format";
import {
  currentFinancialMonthKey,
  financialMonthKey,
  financialMonthLabel,
  financialMonthRange,
  shiftFinancialMonthKey,
} from "@/lib/financial-month";
import { cn } from "@/lib/cn";

export const revalidate = 60;

const GRID_LINE_STEPS = 4;
const MONTHLY_CHART_COUNT = 6;

type BalanceRange = "lastmonth" | "month" | "all";

const RANGE_TABS: { key: BalanceRange; label: string }[] = [
  { key: "lastmonth", label: "Last Month" },
  { key: "month", label: "Month" },
  { key: "all", label: "All Time" },
];

type Focus = "income" | "expenses" | "savings" | "investments";

const FOCUS_LINKS: { key: Focus; href: string; label: string; icon: string }[] = [
  { key: "income", href: "/finance/analytics?focus=income", label: "Income", icon: "trending-up" },
  { key: "expenses", href: "/finance/analytics?focus=expenses", label: "Expenses", icon: "trending-down" },
  { key: "savings", href: "/finance/analytics?focus=savings", label: "Savings", icon: "piggy-bank" },
  { key: "investments", href: "/finance/analytics?focus=investments", label: "Investments", icon: "line-chart" },
];

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

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; focus?: string }>;
}) {
  const { range, focus } = await searchParams;
  const activeRange: BalanceRange = RANGE_TABS.some((t) => t.key === range) ? (range as BalanceRange) : "month";
  const activeFocus = FOCUS_LINKS.find((f) => f.key === focus)?.key;

  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }, { data: categories }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name, icon, starting_balance"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, account_id, category_id"),
    supabase.from("finance_categories").select("id, name, icon"),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const monthKey = currentFinancialMonthKey();
  const { start: monthStart, end: monthEnd } = financialMonthRange(monthKey);
  const lastMonthKey = shiftFinancialMonthKey(monthKey, -1);
  const { start: lastMonthStart, end: lastMonthEnd } = financialMonthRange(lastMonthKey);

  const today = new Date(todayLocalDate() + "T00:00:00");
  const todayStr = todayLocalDate();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const earliestTxDate = (transactions ?? []).reduce(
    (min, tx) => (tx.occurred_on < min ? tx.occurred_on : min),
    todayStr
  );
  const rangeStart = activeRange === "lastmonth" ? lastMonthStart : activeRange === "all" ? earliestTxDate : monthStart;
  const rangeEnd = activeRange === "lastmonth" ? lastMonthEnd : todayStr;
  const rangeLabel = activeRange === "lastmonth" ? "last month" : activeRange === "all" ? "all time" : "this month";

  const startingBalanceTotal = (accounts ?? []).reduce((sum, a) => sum + a.starting_balance, 0);
  let balanceBeforeRange = startingBalanceTotal;
  const dayNet = new Map<string, number>();

  const categoryTotals: Record<string, number> = {};
  const lastMonthCategoryTotals: Record<string, number> = {};
  const ninetyDayTotals: Record<string, number> = {};
  const incomeCategoryTotals: Record<string, number> = {};
  const months = lastMonths(MONTHLY_CHART_COUNT);
  const monthTotals = new Map(months.map((m) => [m.key, { income: 0, expense: 0 }]));
  const accountBalances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    if (tx.occurred_on < rangeStart) balanceBeforeRange += delta;
    else if (tx.occurred_on <= rangeEnd) dayNet.set(tx.occurred_on, (dayNet.get(tx.occurred_on) ?? 0) + delta);
    accountBalances.set(tx.account_id, (accountBalances.get(tx.account_id) ?? 0) + delta);

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
    } else if (tx.occurred_on >= monthStart && tx.occurred_on <= monthEnd) {
      incomeCategoryTotals[tx.category_id] = (incomeCategoryTotals[tx.category_id] ?? 0) + tx.amount;
    }

    const bucket = monthTotals.get(financialMonthKey(tx.occurred_on));
    if (bucket) {
      if (tx.type === "income") bucket.income += tx.amount;
      else bucket.expense += tx.amount;
    }
  }

  const trendPoints: { date: string; balance: number; dateFormatted: string; balanceFormatted: string }[] = [];
  let running = balanceBeforeRange;
  const cursor = new Date(rangeStart + "T00:00:00");
  const rangeEndDate = new Date(rangeEnd + "T00:00:00");
  while (cursor <= rangeEndDate) {
    const dateStr = isoDate(cursor);
    running += dayNet.get(dateStr) ?? 0;
    trendPoints.push({ date: dateStr, balance: running, dateFormatted: formatDate(dateStr), balanceFormatted: formatCurrency(running) });
    cursor.setDate(cursor.getDate() + 1);
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

  const sortedIncomeCategories = Object.entries(incomeCategoryTotals).sort((a, b) => b[1] - a[1]);
  const topIncomeCategories = sortedIncomeCategories.slice(0, CATEGORICAL.length - 1);
  const otherIncomeEntries = sortedIncomeCategories.slice(CATEGORICAL.length - 1);
  const otherIncomeTotal = otherIncomeEntries.reduce((sum, [, amt]) => sum + amt, 0);
  const incomeCategorySegments = topIncomeCategories.map(([id, amt], i) => ({
    categoryId: id,
    categoryIds: [id],
    name: categoriesById[id]?.name ?? "Uncategorized",
    icon: categoriesById[id]?.icon ?? "more-horizontal",
    amount: amt,
    amountFormatted: formatCurrency(amt),
    color: CATEGORICAL[i],
  }));
  if (otherIncomeTotal > 0) {
    incomeCategorySegments.push({
      categoryId: "other",
      categoryIds: otherIncomeEntries.map(([id]) => id),
      name: "Other",
      icon: "more-horizontal",
      amount: otherIncomeTotal,
      amountFormatted: formatCurrency(otherIncomeTotal),
      color: OTHER_SLOT,
    });
  }
  const monthIncomeTotal = sortedIncomeCategories.reduce((sum, [, amt]) => sum + amt, 0);

  const SAVINGS_ICON = "piggy-bank";
  const INVESTMENT_ICON = "trending-up";
  const savingsAccounts = (accounts ?? [])
    .filter((a) => a.icon === SAVINGS_ICON)
    .map((a) => {
      const balance = Math.round((accountBalances.get(a.id) ?? a.starting_balance) * 100) / 100;
      return { id: a.id, name: a.name, icon: a.icon, balance, balanceFormatted: formatCurrency(balance) };
    });
  const investmentAccounts = (accounts ?? [])
    .filter((a) => a.icon === INVESTMENT_ICON)
    .map((a) => {
      const balance = Math.round((accountBalances.get(a.id) ?? a.starting_balance) * 100) / 100;
      return { id: a.id, name: a.name, icon: a.icon, balance, balanceFormatted: formatCurrency(balance) };
    });
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const investmentTotal = investmentAccounts.reduce((sum, a) => sum + a.balance, 0);

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

  const focusMeta = activeFocus ? FOCUS_LINKS.find((f) => f.key === activeFocus) : undefined;

  const incomeVsExpenseChart = (
    <>
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
    </>
  );

  return (
    <div>
      <FinanceBackLink
        href={focusMeta ? "/finance/analytics" : undefined}
        label={focusMeta ? "Back to Analytics" : undefined}
      />
      <div className="mb-6 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-charcoal">{focusMeta ? focusMeta.label : "Analytics"}</h1>
        <FinanceMenuDrawer links={FOCUS_LINKS} title="Analytics" />
      </div>

      {!focusMeta && (
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
              Balance — {rangeLabel}
            </h2>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-cream p-1">
              {RANGE_TABS.map((tab) => (
                <Link
                  key={tab.key}
                  href={tab.key === "month" ? "/finance/analytics" : `/finance/analytics?range=${tab.key}`}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    activeRange === tab.key ? "bg-pink text-ink" : "text-charcoal-soft hover:text-charcoal"
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
          <Card className="mb-6 p-2">
            <BalanceTrendChart points={trendPoints} gridLines={balanceGridLines} />
          </Card>
        </>
      )}

      {(!focusMeta || activeFocus === "expenses") && (
        <>
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
        </>
      )}

      {activeFocus === "income" && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
            Income by category — this month
          </h2>
          <Card className="mb-6">
            <CategoryStackedBar segments={incomeCategorySegments} total={monthIncomeTotal} backTo="analytics" />
          </Card>
          {incomeVsExpenseChart}
        </>
      )}

      {activeFocus === "savings" && (
        <>
          <div className="mb-6">
            <AccountList accounts={savingsAccounts} />
            {savingsAccounts.length > 0 && (
              <p className="mt-3 text-center text-sm text-charcoal-soft">
                Total saved: <span className="font-semibold text-charcoal">{formatCurrency(savingsTotal)}</span>
              </p>
            )}
          </div>
          {incomeVsExpenseChart}
        </>
      )}

      {activeFocus === "investments" && (
        <>
          <div className="mb-6">
            <AccountList accounts={investmentAccounts} />
            {investmentAccounts.length > 0 && (
              <p className="mt-3 text-center text-sm text-charcoal-soft">
                Total invested: <span className="font-semibold text-charcoal">{formatCurrency(investmentTotal)}</span>
              </p>
            )}
          </div>
        </>
      )}

      {!focusMeta && incomeVsExpenseChart}
    </div>
  );
}
