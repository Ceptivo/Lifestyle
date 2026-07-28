import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddTransactionForm } from "@/components/finance/AddTransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { cn } from "@/lib/cn";
import type { FinanceType } from "@/lib/types";

export const revalidate = 60;

const TABS: { key: "all" | FinanceType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "expense", label: "Spending" },
  { key: "income", label: "Income" },
];

const BACK_TARGETS: Record<string, { href: string; label: string }> = {
  budgets: { href: "/finance/budgets", label: "Back to Budgets" },
  analytics: { href: "/finance/analytics", label: "Back to Analytics" },
};

function withParams(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const s = qs.toString();
  return `/finance/transactions${s ? `?${s}` : ""}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; add?: string; category?: string; from?: string }>;
}) {
  const { filter, add, category, from } = await searchParams;
  const activeTab = TABS.some((t) => t.key === filter) ? (filter as (typeof TABS)[number]["key"]) : "all";
  const quickAddOpen = add === "expense" || add === "income" || add === "other";
  const quickAddType: FinanceType = add === "income" ? "income" : "expense";
  const categoryIds = category ? category.split(",").filter(Boolean) : null;
  const backTarget = (from && BACK_TARGETS[from]) || { href: "/finance", label: "Back to Finance" };

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
    (tx) => (activeTab === "all" || tx.type === activeTab) && (!categoryIds || categoryIds.includes(tx.category_id))
  );

  const categoryFilterLabel =
    categoryIds && categoryIds.length === 1
      ? categoriesById[categoryIds[0]]?.name ?? "Uncategorized"
      : categoryIds
        ? "Other categories"
        : null;
  const clearCategoryHref = withParams({ filter, from });

  return (
    <div>
      <FinanceBackLink href={backTarget.href} label={backTarget.label} />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Transactions</h1>

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

      {categoryFilterLabel && (
        <Link
          href={clearCategoryHref}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-pink-soft px-3 py-1.5 text-xs font-semibold text-pink-dark"
        >
          Category: {categoryFilterLabel}
          <span aria-hidden>✕</span>
        </Link>
      )}

      <div className="mb-4 flex items-center gap-5 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={withParams({ filter: tab.key === "all" ? undefined : tab.key, category, from })}
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
