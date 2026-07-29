import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/actions/finance";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatDateHeading } from "@/lib/format";
import type { Database } from "@/lib/types";

type Transaction = Database["public"]["Tables"]["finance_transactions"]["Row"];
type LookupEntry = { name: string; icon: string };

export function TransactionList({
  transactions,
  accountsById,
  categoriesById,
  emptyMessage = "No transactions yet. Add the first one.",
}: {
  transactions: Transaction[];
  accountsById: Record<string, LookupEntry>;
  categoriesById: Record<string, LookupEntry>;
  emptyMessage?: string;
}) {
  if (!transactions.length) {
    return <p className="text-center text-sm text-charcoal-soft">{emptyMessage}</p>;
  }

  // Transactions arrive sorted by occurred_on desc, so same-day items are
  // always adjacent — grouping is just a single pass, no re-sorting.
  const groups: { date: string; items: Transaction[] }[] = [];
  for (const tx of transactions) {
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.date === tx.occurred_on) {
      currentGroup.items.push(tx);
    } else {
      groups.push({ date: tx.occurred_on, items: [tx] });
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
            {formatDateHeading(group.date)}
          </h3>
          <ul className="space-y-2">
            {group.items.map((tx) => {
              const category = categoriesById[tx.category_id];
              const account = accountsById[tx.account_id];
              const isIncome = tx.type === "income";
              return (
                <li key={tx.id}>
                  <Card className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                      <Icon name={category?.icon ?? "more-horizontal"} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words hyphens-auto text-sm font-medium text-charcoal">
                        {tx.description || category?.name || "Uncategorized"}
                      </p>
                      <p className="truncate text-xs text-charcoal-soft">
                        {category?.name ?? "Uncategorized"} · {account?.name ?? "—"}
                      </p>
                    </div>
                    <p className={`shrink-0 text-sm font-semibold ${isIncome ? "text-emerald-600" : "text-charcoal"}`}>
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                    <form action={deleteTransaction.bind(null, tx.id)}>
                      <button
                        type="submit"
                        aria-label="Delete transaction"
                        className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
