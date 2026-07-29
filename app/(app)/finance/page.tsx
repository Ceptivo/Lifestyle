import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { AccountForm } from "@/components/finance/AccountForm";
import { AccountList } from "@/components/finance/AccountList";
import { FinanceMenuDrawer } from "@/components/finance/FinanceMenuDrawer";
import { RingProgress } from "@/components/charts/RingProgress";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import { currentFinancialMonthKey, financialMonthRange, shiftFinancialMonthKey } from "@/lib/financial-month";

export const revalidate = 60;

const QUICK_LINKS = [
  { href: "/finance/profile", label: "Profile", icon: "user-cog" },
  { href: "/finance/analytics", label: "Analytics", icon: "pie-chart" },
  { href: "/finance/transactions", label: "Transactions", icon: "receipt" },
  { href: "/finance/subscriptions", label: "Subscriptions", icon: "repeat" },
  { href: "/finance/forecast", label: "Forecast", icon: "trending-up" },
  { href: "/finance/budgets", label: "Budgets", icon: "list-checks" },
  { href: "/finance/goals", label: "Goals", icon: "flag" },
  { href: "/finance/accounts", label: "Accounts", icon: "wallet" },
  { href: "/finance/categories", label: "Categories", icon: "tag" },
];

function pctDelta(current: number, previous: number): number {
  return previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : NaN;
}

export default async function FinanceDashboardPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name, icon, starting_balance").order("created_at"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, account_id, category_id"),
  ]);

  const monthKey = currentFinancialMonthKey();
  const { start: monthStart, end: monthEnd } = financialMonthRange(monthKey);
  const lastMonthKey = shiftFinancialMonthKey(monthKey, -1);
  const { start: lastMonthStart, end: lastMonthEnd } = financialMonthRange(lastMonthKey);

  const startingBalanceTotal = (accounts ?? []).reduce((sum, a) => sum + a.starting_balance, 0);

  const accountBalances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));
  let monthIncome = 0;
  let monthExpense = 0;
  let lastMonthIncome = 0;
  let lastMonthExpense = 0;
  let balanceAtMonthStart = startingBalanceTotal;

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    accountBalances.set(tx.account_id, (accountBalances.get(tx.account_id) ?? 0) + delta);

    if (tx.occurred_on < monthStart) balanceAtMonthStart += delta;

    if (tx.occurred_on >= monthStart && tx.occurred_on <= monthEnd) {
      if (tx.type === "income") monthIncome += tx.amount;
      else monthExpense += tx.amount;
    } else if (tx.occurred_on >= lastMonthStart && tx.occurred_on <= lastMonthEnd) {
      if (tx.type === "income") lastMonthIncome += tx.amount;
      else lastMonthExpense += tx.amount;
    }
  }

  const balance = [...accountBalances.values()].reduce((sum, b) => sum + b, 0);
  const accountsWithBalance = (accounts ?? []).map((a) => {
    const accountBalance = accountBalances.get(a.id) ?? a.starting_balance;
    return {
      id: a.id,
      name: a.name,
      icon: a.icon,
      balance: accountBalance,
      balanceFormatted: formatCurrency(accountBalance),
    };
  });

  const monthSaved = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? (monthSaved / monthIncome) * 100 : 0;
  const expenseChangePct = pctDelta(monthExpense, lastMonthExpense);
  const savingsHeadline = monthSaved >= 0 ? "Well done!" : "Heads up";
  const savingsBody = Number.isFinite(expenseChangePct)
    ? `Your spending ${expenseChangePct <= 0 ? "reduced" : "increased"} by ${Math.abs(expenseChangePct).toFixed(0)}% from last month.`
    : "Track a full month to see how your spending is trending.";

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Finance</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Track what comes in and what goes out.</p>
        </div>
        <FinanceMenuDrawer links={QUICK_LINKS} />
      </div>

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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Accounts</h2>
      <div className="mb-6">
        <AccountList accounts={accountsWithBalance} />
        <div className="mt-3">
          <AccountForm />
        </div>
      </div>

    </div>
  );
}
