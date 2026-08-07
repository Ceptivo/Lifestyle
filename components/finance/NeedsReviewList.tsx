"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { resolveTransactionReview } from "@/app/actions/finance-import";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Database, FinanceType } from "@/lib/types";

type Transaction = Database["public"]["Tables"]["finance_transactions"]["Row"];
type Category = { id: string; name: string; type: FinanceType };

function ReviewRow({ tx, categories }: { tx: Transaction; categories: Category[] }) {
  const [categoryId, setCategoryId] = useState(tx.category_id);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isIncome = tx.type === "income";

  return (
    <Card className="border-orange-500/30 px-4 py-3.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal-soft/70">{formatDate(tx.occurred_on)}</p>
          <p className="break-words text-sm font-medium text-charcoal">{tx.description || "Untitled"}</p>
          {tx.review_note && <p className="mt-0.5 text-xs text-orange-600">{tx.review_note}</p>}
        </div>
        <p className={`shrink-0 text-sm font-semibold tabular-nums ${isIncome ? "text-emerald-600" : "text-danger"}`}>
          {isIncome ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select className="flex-1" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories
            .filter((c) => c.type === tx.type)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            const fd = new FormData();
            fd.set("categoryId", categoryId);
            startTransition(async () => {
              await resolveTransactionReview(tx.id, fd);
              router.refresh();
            });
          }}
          className="shrink-0 px-3"
        >
          <CheckCircle2 size={16} />
        </Button>
      </div>
    </Card>
  );
}

export function NeedsReviewList({ transactions, categories }: { transactions: Transaction[]; categories: Category[] }) {
  if (!transactions.length) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-charcoal">Needs review ({transactions.length})</h2>
      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li key={tx.id}>
            <ReviewRow tx={tx} categories={categories} />
          </li>
        ))}
      </ul>
    </div>
  );
}
