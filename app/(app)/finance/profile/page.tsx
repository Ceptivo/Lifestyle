import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { monthlyEquivalent } from "@/lib/subscriptions";
import { formatCurrency, todayLocalDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }, { data: subscriptions }, { data: goals }, { data: budgets }] =
    await Promise.all([
      supabase.from("finance_accounts").select("id, name, starting_balance"),
      supabase.from("finance_transactions").select("type, amount, category_id, account_id, occurred_on"),
      supabase.from("finance_subscriptions").select("amount, cycle").eq("status", "active"),
      supabase.from("finance_goals").select("current_amount, target_amount"),
      supabase.from("finance_budgets").select("category_id, monthly_limit"),
    ]);

  const monthPrefix = todayLocalDate().slice(0, 7);

  const balances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));
  let lifetimeIncome = 0;
  let lifetimeExpense = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  const spentThisMonthByCategory: Record<string, number> = {};

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    balances.set(tx.account_id, (balances.get(tx.account_id) ?? 0) + delta);

    if (tx.type === "income") lifetimeIncome += tx.amount;
    else lifetimeExpense += tx.amount;

    if (tx.occurred_on.startsWith(monthPrefix)) {
      if (tx.type === "income") monthIncome += tx.amount;
      else {
        monthExpense += tx.amount;
        spentThisMonthByCategory[tx.category_id] = (spentThisMonthByCategory[tx.category_id] ?? 0) + tx.amount;
      }
    }
  }

  const netWorth = [...balances.values()].reduce((sum, b) => sum + b, 0);

  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

  const monthlyCommitment = (subscriptions ?? []).reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.cycle), 0);

  const activeGoals = (goals ?? []).filter((g) => g.current_amount < g.target_amount);
  const totalSaved = (goals ?? []).reduce((sum, g) => sum + g.current_amount, 0);

  const budgetsWithinLimit = (budgets ?? []).filter(
    (b) => (spentThisMonthByCategory[b.category_id] ?? 0) <= b.monthly_limit
  ).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Net worth" value={formatCurrency(netWorth)} />
        <StatCard
          label="Savings rate"
          value={monthIncome > 0 ? `${savingsRate.toFixed(0)}%` : "—"}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Lifetime income" value={formatCurrency(lifetimeIncome)} />
        <StatCard label="Lifetime expenses" value={formatCurrency(lifetimeExpense)} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Commitments</h2>
      <Card className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-soft">Monthly recurring (subscriptions)</p>
          <p className="text-sm font-semibold text-charcoal">{formatCurrency(monthlyCommitment)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-soft">Budgets within limit this month</p>
          <p className={cn("text-sm font-semibold", budgetsWithinLimit === (budgets ?? []).length ? "text-emerald-600" : "text-pink-dark")}>
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
