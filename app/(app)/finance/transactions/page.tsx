import Link from "next/link";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TransactionList } from "@/components/finance/TransactionList";
import { NeedsReviewList } from "@/components/finance/NeedsReviewList";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { cn } from "@/lib/cn";
import type { FinanceType } from "@/lib/types";

export const revalidate = 60;

const TABS: { key: "all" | FinanceType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "expense", label: "Expenses" },
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
  searchParams: Promise<{ filter?: string; category?: string; from?: string }>;
}) {
  const { filter, category, from } = await searchParams;
  const activeTab = TABS.some((t) => t.key === filter) ? (filter as (typeof TABS)[number]["key"]) : "all";
  const categoryIds = category ? category.split(",").filter(Boolean) : null;
  const backTarget = (from && BACK_TARGETS[from]) || { href: "/finance", label: "Back to Finance" };

  const supabase = createClient();
  const [{ data: accounts }, { data: categories }, { data: transactions }, { data: needsReview }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name").order("created_at"),
    supabase.from("finance_categories").select("id, name, icon, type").order("name"),
    supabase
      .from("finance_transactions")
      .select("*")
      .eq("needs_review", false)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("finance_transactions").select("*").eq("needs_review", true).order("occurred_on", { ascending: false }),
  ]);

  // Stable sort on top of the DB order: within the same day, income lands
  // before expenses (money in, then money out) while created_at order is
  // preserved as the tiebreak within each type.
  const orderedTransactions = [...(transactions ?? [])].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return a.occurred_on < b.occurred_on ? 1 : -1;
    if (a.type !== b.type) return a.type === "income" ? -1 : 1;
    return 0;
  });

  const accountsById = Object.fromEntries((accounts ?? []).map((a) => [a.id, { name: a.name, icon: "wallet" }]));
  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));

  const filteredTransactions = orderedTransactions.filter(
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
        <Link
          href="/finance/import"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-ink hover:bg-pink-dark"
        >
          <Upload size={16} /> Import statement
        </Link>
      </div>

      <NeedsReviewList transactions={needsReview ?? []} categories={categories ?? []} />

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
            : `No ${activeTab === "income" ? "income" : "expenses"} logged yet.`
        }
      />
    </div>
  );
}
