import Link from "next/link";
import { Receipt, PieChart, ListChecks, Flag, TrendingUp, Wallet, Repeat, Tag, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { PageHeading } from "@/components/ui/PageHeading";
import { AccountsSummary } from "@/components/finance/AccountsSummary";
import { BalanceTrendChart } from "@/components/charts/BalanceTrendChart";
import { CategoryStackedBar } from "@/components/charts/CategoryStackedBar";
import { MiniColumnChart } from "@/components/charts/MiniColumnChart";
import { RingProgress } from "@/components/charts/RingProgress";
import { CATEGORICAL, OTHER_SLOT } from "@/lib/chart-colors";
import { formatCurrency, formatCurrencyCompact, formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

const QUICK_LINKS = [
  { href: "/finance/transactions", label: "Transactions", icon: Receipt },
  { href: "/finance/analytics", label: "Analytics", icon: PieChart },
  { href: "/finance/budgets", label: "Budgets", icon: ListChecks },
  { href: "/finance/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/finance/goals", label: "Goals", icon: Flag },
  { href: "/finance/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/finance/accounts", label: "Accounts", icon: Wallet },
  { href: "/finance/categories", label: "Categories", icon: Tag },
  { href: "/finance/profile", label: "Profile", icon: UserCog },
];

const GRID_LINE_STEPS = 4;
const TREND_WINDOW_DAYS = 30;
const MONTHLY_CHART_COUNT = 6;

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function pctDelta(current: number, previous: number): number {
  return previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : NaN;
}

export default async function FinanceDashboardPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }, { data: categories }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name, icon, starting_balance").order("created_at"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, account_id, category_id"),
    supabase.from("finance_categories").select("id, name, icon"),
  ]);

  const today = new Date(todayLocalDate() + "T00:00:00");
  const monthPrefix = todayLocalDate().slice(0, 7);
  const monthStart = `${monthPrefix}-01`;
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const windowStartDate = new Date(today);
  windowStartDate.setDate(windowStartDate.getDate() - (TREND_WINDOW_DAYS - 1));
  const windowStart = isoDate(windowStartDate);

  const startingBalanceTotal = (accounts ?? []).reduce((sum, a) => sum + a.starting_balance, 0);
  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));

  const accountBalances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));
  let monthIncome = 0;
  let monthExpense = 0;
  let lastMonthIncome = 0;
  let lastMonthExpense = 0;
  let balanceAtMonthStart = startingBalanceTotal;
  let balanceBeforeWindow = startingBalanceTotal;
  const dayNet = new Map<string, number>();
  const categoryTotals: Record<string, number> = {};

  const monthKeys = Array.from({ length: MONTHLY_CHART_COUNT }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (MONTHLY_CHART_COUNT - 1 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("en-US", { month: "short" }) };
  });
  const monthlyTotals = new Map(monthKeys.map((m) => [m.key, { income: 0, expense: 0 }]));

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    accountBalances.set(tx.account_id, (accountBalances.get(tx.account_id) ?? 0) + delta);

    if (tx.occurred_on < monthStart) balanceAtMonthStart += delta;
    if (tx.occurred_on < windowStart) balanceBeforeWindow += delta;
    else dayNet.set(tx.occurred_on, (dayNet.get(tx.occurred_on) ?? 0) + delta);

    if (tx.occurred_on.startsWith(monthPrefix)) {
      if (tx.type === "income") monthIncome += tx.amount;
      else {
        monthExpense += tx.amount;
        categoryTotals[tx.category_id] = (categoryTotals[tx.category_id] ?? 0) + tx.amount;
      }
    } else if (tx.occurred_on.startsWith(lastMonthPrefix)) {
      if (tx.type === "income") lastMonthIncome += tx.amount;
      else lastMonthExpense += tx.amount;
    }

    const bucket = monthlyTotals.get(tx.occurred_on.slice(0, 7));
    if (bucket) {
      if (tx.type === "income") bucket.income += tx.amount;
      else bucket.expense += tx.amount;
    }
  }

  const balance = [...accountBalances.values()].reduce((sum, b) => sum + b, 0);
  const accountsWithBalance = (accounts ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    balance: accountBalances.get(a.id) ?? a.starting_balance,
  }));

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

  const columnMax = Math.max(1, ...monthKeys.flatMap((m) => [monthlyTotals.get(m.key)?.income ?? 0, monthlyTotals.get(m.key)?.expense ?? 0]));
  const columnGridLines = [
    { value: columnMax, label: formatCurrency(columnMax) },
    { value: columnMax / 2, label: formatCurrency(columnMax / 2) },
    { value: 0, label: formatCurrency(0) },
  ];

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

  const monthSaved = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? (monthSaved / monthIncome) * 100 : 0;
  const expenseChangePct = pctDelta(monthExpense, lastMonthExpense);
  const savingsHeadline = monthSaved >= 0 ? "Well done!" : "Heads up";
  const savingsBody = Number.isFinite(expenseChangePct)
    ? `Your spending ${expenseChangePct <= 0 ? "reduced" : "increased"} by ${Math.abs(expenseChangePct).toFixed(0)}% from last month.`
    : "Track a full month to see how your spending is trending.";

  return (
    <div>
      <PageHeading title="Finance" subtitle="Track what comes in and what goes out." />

      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard
          label="Balance"
          value={formatCurrencyCompact(balance)}
          delta={{ pct: pctDelta(balance, balanceAtMonthStart), goodDirection: "up" }}
        />
        <StatCard
          label="Income"
          value={formatCurrencyCompact(monthIncome)}
          delta={{ pct: pctDelta(monthIncome, lastMonthIncome), goodDirection: "up" }}
        />
        <StatCard
          label="Expenses"
          value={formatCurrencyCompact(monthExpense)}
          delta={{ pct: pctDelta(monthExpense, lastMonthExpense), goodDirection: "down" }}
        />
      </div>

      <Card className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold text-charcoal">{savingsHeadline}</p>
          <p className="mt-1 text-xs text-charcoal-soft">{savingsBody}</p>
          <Link href="/finance/profile" className="mt-2 inline-block text-xs font-semibold text-pink">
            View Details
          </Link>
        </div>
        <RingProgress pct={savingsRate} value={formatCurrencyCompact(monthSaved)} label="Saved" />
      </Card>

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
        <CategoryStackedBar segments={categorySegments} total={monthExpense} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Income vs. expenses</h2>
      <Card className="mb-6">
        <MiniColumnChart
          gridLines={columnGridLines}
          months={monthKeys.map((m) => {
            const income = monthlyTotals.get(m.key)?.income ?? 0;
            const expense = monthlyTotals.get(m.key)?.expense ?? 0;
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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Accounts</h2>
      <div className="mb-6">
        <AccountsSummary accounts={accountsWithBalance} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Go to</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <Icon size={16} />
              </span>
              <p className="min-w-0 truncate font-medium text-charcoal">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
