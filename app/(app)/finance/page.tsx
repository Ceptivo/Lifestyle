import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/ui/PageHeading";
import { StatCard } from "@/components/ui/Card";
import { AddTransactionForm } from "@/components/finance/AddTransactionForm";
import { CategoryBreakdown } from "@/components/finance/CategoryBreakdown";
import { TransactionList } from "@/components/finance/TransactionList";
import { formatCurrency, todayLocalDate } from "@/lib/format";
import type { FinanceCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const supabase = createClient();
  const [{ data: allForStats }, { data: recent }] = await Promise.all([
    supabase.from("finance_transactions").select("type, category, amount, occurred_on"),
    supabase
      .from("finance_transactions")
      .select("*")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const all = recent ?? [];
  const monthPrefix = todayLocalDate().slice(0, 7); // YYYY-MM

  let balance = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  const categoryTotals: Partial<Record<FinanceCategory, number>> = {};

  for (const tx of allForStats ?? []) {
    balance += tx.type === "income" ? tx.amount : -tx.amount;

    if (tx.occurred_on.startsWith(monthPrefix)) {
      if (tx.type === "income") {
        monthIncome += tx.amount;
      } else {
        monthExpense += tx.amount;
        categoryTotals[tx.category] = (categoryTotals[tx.category] ?? 0) + tx.amount;
      }
    }
  }

  return (
    <div>
      <PageHeading title="Finance" subtitle="Track what comes in and what goes out." />

      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard label="Balance" value={formatCurrency(balance)} />
        <StatCard label="Income" value={formatCurrency(monthIncome)} />
        <StatCard label="Expenses" value={formatCurrency(monthExpense)} />
      </div>

      <div className="mb-6">
        <AddTransactionForm />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Spending by category
      </h2>
      <div className="mb-6">
        <CategoryBreakdown totals={categoryTotals} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Recent transactions
      </h2>
      <TransactionList transactions={all} />
    </div>
  );
}
