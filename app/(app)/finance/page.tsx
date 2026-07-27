import Link from "next/link";
import { Receipt, PieChart, ListChecks, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { AccountsSummary } from "@/components/finance/AccountsSummary";
import { formatCurrency, todayLocalDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { href: "/finance/transactions", label: "Transactions", icon: Receipt },
  { href: "/finance/analytics", label: "Analytics", icon: PieChart },
  { href: "/finance/budgets", label: "Budgets", icon: ListChecks },
  { href: "/finance/goals", label: "Goals", icon: Flag },
];

export default async function FinanceDashboardPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name, icon, starting_balance").order("created_at"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, account_id"),
  ]);

  const monthPrefix = todayLocalDate().slice(0, 7);

  const accountBalances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));
  let monthIncome = 0;
  let monthExpense = 0;

  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    accountBalances.set(tx.account_id, (accountBalances.get(tx.account_id) ?? 0) + delta);

    if (tx.occurred_on.startsWith(monthPrefix)) {
      if (tx.type === "income") monthIncome += tx.amount;
      else monthExpense += tx.amount;
    }
  }

  const balance = [...accountBalances.values()].reduce((sum, b) => sum + b, 0);
  const accountsWithBalance = (accounts ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    balance: accountBalances.get(a.id) ?? a.starting_balance,
  }));

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard label="Balance" value={formatCurrency(balance)} />
        <StatCard label="Income" value={formatCurrency(monthIncome)} />
        <StatCard label="Expenses" value={formatCurrency(monthExpense)} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Accounts</h2>
      <div className="mb-6">
        <AccountsSummary accounts={accountsWithBalance} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Go to</h2>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <Icon size={16} />
              </span>
              <p className="font-medium text-charcoal">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
