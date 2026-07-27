import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { InsightList } from "@/components/finance/InsightList";
import { monthlyEquivalent } from "@/lib/subscriptions";
import { generateInsights } from "@/lib/insights";
import { formatCurrency, todayLocalDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const HISTORY_MONTHS = 3;

export default async function ProfilePage() {
  const supabase = createClient();
  const [
    { data: accounts },
    { data: transactions },
    { data: categories },
    { data: subscriptions },
    { data: goals },
    { data: budgets },
  ] = await Promise.all([
    supabase.from("finance_accounts").select("id, name, starting_balance"),
    supabase.from("finance_transactions").select("type, amount, category_id, account_id, occurred_on"),
    supabase.from("finance_categories").select("id, name"),
    supabase.from("finance_subscriptions").select("amount, cycle").eq("status", "active"),
    supabase.from("finance_goals").select("name, current_amount, target_amount, target_date"),
    supabase.from("finance_budgets").select("category_id, monthly_limit"),
  ]);

  const today = new Date(todayLocalDate() + "T00:00:00");
  const monthPrefix = todayLocalDate().slice(0, 7);
  const categoryNameById = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));

  const monthKeys = Array.from({ length: HISTORY_MONTHS }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (HISTORY_MONTHS - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const priorMonthKeys = monthKeys.filter((k) => k !== monthPrefix);

  const monthlyIncome = new Map(monthKeys.map((k) => [k, 0]));
  const monthlyExpense = new Map(monthKeys.map((k) => [k, 0]));
  const monthlyCategorySpend = new Map(monthKeys.map((k) => [k, {} as Record<string, number>]));

  const balances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));
  let lifetimeIncome = 0;
  let lifetimeExpense = 0;

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    balances.set(tx.account_id, (balances.get(tx.account_id) ?? 0) + delta);

    if (tx.type === "income") lifetimeIncome += tx.amount;
    else lifetimeExpense += tx.amount;

    const txMonth = tx.occurred_on.slice(0, 7);
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
  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

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

  const activeGoals = (goals ?? []).filter((g) => g.current_amount < g.target_amount);
  const totalSaved = (goals ?? []).reduce((sum, g) => sum + g.current_amount, 0);

  const budgetsWithSpend = (budgets ?? []).map((b) => ({
    categoryName: categoryNameById[b.category_id] ?? "Uncategorized",
    limit: b.monthly_limit,
    spent: thisMonthCategoryTotals[b.category_id] ?? 0,
  }));
  const budgetsWithinLimit = budgetsWithSpend.filter((b) => b.spent <= b.limit).length;

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
  });

  return (
    <div>
      <Link href="/finance" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-charcoal-soft hover:text-charcoal">
        <ChevronLeft size={16} />
        Back to Overview
      </Link>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Net worth" value={formatCurrency(netWorth)} />
        <StatCard label="Savings rate" value={monthIncome > 0 ? `${savingsRate.toFixed(0)}%` : "—"} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Lifetime income" value={formatCurrency(lifetimeIncome)} />
        <StatCard label="Lifetime expenses" value={formatCurrency(lifetimeExpense)} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Insights & advice</h2>
      <div className="mb-6">
        <InsightList insights={insights} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Commitments</h2>
      <Card className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-soft">Monthly recurring (subscriptions)</p>
          <p className="text-sm font-semibold text-charcoal">{formatCurrency(monthlyCommitment)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-soft">Budgets within limit this month</p>
          <p
            className={cn(
              "text-sm font-semibold",
              budgetsWithinLimit === (budgets ?? []).length ? "text-emerald-600" : "text-danger"
            )}
          >
            {budgetsWithinLimit} of {(budgets ?? []).length}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-soft">Active goals</p>
          <p className="text-sm font-semibold text-charcoal">{activeGoals.length}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-soft">Total saved toward goals</p>
          <p className="text-sm font-semibold text-charcoal">{formatCurrency(totalSaved)}</p>
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Accounts</h2>
      <Card className="space-y-2">
        {(accounts ?? []).map((a) => (
          <div key={a.id} className="flex items-center justify-between">
            <p className="text-sm text-charcoal-soft">{a.name}</p>
            <p className="text-sm font-semibold tabular-nums text-charcoal">
              {formatCurrency(balances.get(a.id) ?? a.starting_balance)}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
