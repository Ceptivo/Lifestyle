import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddTransactionForm } from "@/components/finance/AddTransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { cn } from "@/lib/cn";
import type { FinanceType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: { key: "all" | FinanceType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "expense", label: "Spending" },
  { key: "income", label: "Income" },
];

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; add?: string }>;
}) {
  const { filter, add } = await searchParams;
  const activeTab = TABS.some((t) => t.key === filter) ? (filter as (typeof TABS)[number]["key"]) : "all";
  const quickAddOpen = add === "expense" || add === "income" || add === "other";
  const quickAddType: FinanceType = add === "income" ? "income" : "expense";

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

  const filteredTransactions = (transactions ?? []).filter(
    (tx) => activeTab === "all" || tx.type === activeTab
  );

  return (
    <div>
      <div className="mb-6">
        <AddTransactionForm
          accounts={accounts ?? []}
          categories={categories ?? []}
          initialOpen={quickAddOpen}
          initialType={quickAddType}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Recent transactions</h2>
      </div>

      <div className="mb-4 flex items-center gap-5 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/finance/transactions" : `/finance/transactions?filter=${tab.key}`}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-sm transition-colors",
              activeTab === tab.key
                ? "border-pink font-semibold text-charcoal"
                : "border-transparent text-charcoal-soft hover:text-charcoal"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <TransactionList
        transactions={filteredTransactions}
        accountsById={accountsById}
        categoriesById={categoriesById}
        emptyMessage={
          activeTab === "all"
            ? "No transactions yet. Add the first one."
            : `No ${activeTab === "income" ? "income" : "spending"} logged yet.`
        }
      />
    </div>
  );
}
