import { createClient } from "@/lib/supabase/server";
import { InsightList } from "@/components/finance/InsightList";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { FinanceMenuDrawer } from "@/components/finance/FinanceMenuDrawer";
import { monthlyEquivalent } from "@/lib/subscriptions";
import { generateInsights, type InsightStatus } from "@/lib/insights";
import { computeForecast } from "@/lib/forecast";
import { todayLocalDate } from "@/lib/format";
import { currentFinancialMonthKey, financialMonthKey, shiftFinancialMonthKey } from "@/lib/financial-month";

export const revalidate = 60;

const HISTORY_MONTHS = 3;

const TABS: { key: "all" | InsightStatus; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "pie-chart" },
  { key: "warning", label: "Needs Attention", icon: "alert-triangle" },
  { key: "tip", label: "Worth a Look", icon: "lightbulb" },
  { key: "good", label: "On Track", icon: "trending-up" },
];

export default async function AllInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeTab = TABS.some((t) => t.key === status) ? (status as (typeof TABS)[number]["key"]) : "all";
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }, { data: categories }, { data: subscriptions }, { data: goals }, { data: budgets }] =
    await Promise.all([
      supabase.from("finance_accounts").select("id, starting_balance"),
      supabase.from("finance_transactions").select("type, amount, category_id, account_id, occurred_on, subscription_id"),
      supabase.from("finance_categories").select("id, name"),
      supabase
        .from("finance_subscriptions")
        .select("id, name, amount, cycle, next_due_date, is_mandatory")
        .eq("status", "active"),
      supabase.from("finance_goals").select("name, current_amount, target_amount, target_date"),
      supabase.from("finance_budgets").select("category_id, monthly_limit"),
    ]);

  const monthPrefix = currentFinancialMonthKey();
  const categoryNameById = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));

  const monthKeys = Array.from({ length: HISTORY_MONTHS }, (_, i) =>
    shiftFinancialMonthKey(monthPrefix, -(HISTORY_MONTHS - 1 - i))
  );
  const priorMonthKeys = monthKeys.filter((k) => k !== monthPrefix);

  const monthlyIncome = new Map(monthKeys.map((k) => [k, 0]));
  const monthlyExpense = new Map(monthKeys.map((k) => [k, 0]));
  const monthlyCategorySpend = new Map(monthKeys.map((k) => [k, {} as Record<string, number>]));

  const balances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    balances.set(tx.account_id, (balances.get(tx.account_id) ?? 0) + delta);

    const txMonth = financialMonthKey(tx.occurred_on);
    if (monthlyIncome.has(txMonth)) {
      if (tx.type === "income") {
        monthlyIncome.set(txMonth, (monthlyIncome.get(txMonth) ?? 0) + tx.amount);
      } else {
        monthlyExpense.set(txMonth, (monthlyExpense.get(txMonth) ?? 0) + tx.amount);
        const bucket = monthlyCategorySpend.get(txMonth)!;
        bucket[tx.category_id] = (bucket[tx.category_id] ?? 0) + tx.amount;
      }
    }
  }

  const netWorth = [...balances.values()].reduce((sum, b) => sum + b, 0);
  const monthIncome = monthlyIncome.get(monthPrefix) ?? 0;
  const monthExpense = monthlyExpense.get(monthPrefix) ?? 0;

  const activePriorMonths = priorMonthKeys.filter(
    (k) => (monthlyIncome.get(k) ?? 0) > 0 || (monthlyExpense.get(k) ?? 0) > 0
  );
  const monthsOfHistory = activePriorMonths.length;
  const avgMonthlyIncome =
    monthsOfHistory > 0
      ? activePriorMonths.reduce((sum, k) => sum + (monthlyIncome.get(k) ?? 0), 0) / monthsOfHistory
      : monthIncome;
  const avgMonthlyExpense =
    monthsOfHistory > 0
      ? activePriorMonths.reduce((sum, k) => sum + (monthlyExpense.get(k) ?? 0), 0) / monthsOfHistory
      : monthExpense;

  const thisMonthCategoryTotals = monthlyCategorySpend.get(monthPrefix) ?? {};
  const categorySpend = Object.entries(thisMonthCategoryTotals).map(([categoryId, amount]) => {
    const avgAmount =
      monthsOfHistory > 0
        ? activePriorMonths.reduce((sum, k) => sum + (monthlyCategorySpend.get(k)?.[categoryId] ?? 0), 0) /
          monthsOfHistory
        : 0;
    return { categoryId, name: categoryNameById[categoryId] ?? "Uncategorized", amount, avgAmount };
  });

  const monthlyCommitment = (subscriptions ?? []).reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.cycle), 0);

  const budgetsWithSpend = (budgets ?? []).map((b) => ({
    categoryName: categoryNameById[b.category_id] ?? "Uncategorized",
    limit: b.monthly_limit,
    spent: thisMonthCategoryTotals[b.category_id] ?? 0,
  }));

  const forecast = computeForecast(accounts ?? [], transactions ?? [], subscriptions ?? []);

  const insights = generateInsights({
    netWorth,
    avgMonthlyIncome,
    avgMonthlyExpense,
    monthsOfHistory,
    categorySpend,
    monthlySubscriptionCommitment: monthlyCommitment,
    budgets: budgetsWithSpend,
    goals: (goals ?? []).map((g) => ({
      name: g.name,
      currentAmount: g.current_amount,
      targetAmount: g.target_amount,
      targetDate: g.target_date,
    })),
    today: todayLocalDate(),
    forecast: {
      firstNegativeLabel: forecast.firstNegative?.label ?? null,
      monthlyNet: forecast.monthlyNet,
      biggestSubscription: forecast.biggestCancellableSubscription
        ? { name: forecast.biggestCancellableSubscription.name, amount: forecast.biggestCancellableSubscription.amount }
        : null,
    },
  });

  const filteredInsights = activeTab === "all" ? insights : insights.filter((i) => i.status === activeTab);
  const activeTabMeta = TABS.find((t) => t.key === activeTab)!;
  const drawerLinks = TABS.map((tab) => {
    const count = tab.key === "all" ? insights.length : insights.filter((i) => i.status === tab.key).length;
    return {
      href: tab.key === "all" ? "/finance/profile/insights" : `/finance/profile/insights?status=${tab.key}`,
      label: `${tab.label} (${count})`,
      icon: tab.icon,
    };
  });

  return (
    <div>
      <FinanceBackLink href="/finance/profile" label="Back to Profile" />
      <div className="mb-6 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-charcoal">
          {activeTab === "all" ? "All Insights" : activeTabMeta.label}
        </h1>
        <FinanceMenuDrawer links={drawerLinks} title="Insights" />
      </div>

      <InsightList
        insights={filteredInsights}
        emptyMessage={
          activeTab === "all"
            ? undefined
            : `No insights in "${TABS.find((t) => t.key === activeTab)?.label}" right now.`
        }
      />
    </div>
  );
}
