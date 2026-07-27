import { createClient } from "@/lib/supabase/server";
import { AddTransactionForm } from "@/components/finance/AddTransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: categories }, { data: transactions }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name").order("created_at"),
    supabase.from("finance_categories").select("id, name, icon, type").order("name"),
    supabase
      .from("finance_transactions")
      .select("*")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const accountsById = Object.fromEntries((accounts ?? []).map((a) => [a.id, { name: a.name, icon: "wallet" }]));
  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));

  return (
    <div>
      <div className="mb-6">
        <AddTransactionForm accounts={accounts ?? []} categories={categories ?? []} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Recent transactions</h2>
      <TransactionList
        transactions={transactions ?? []}
        accountsById={accountsById}
        categoriesById={categoriesById}
      />
    </div>
  );
}
