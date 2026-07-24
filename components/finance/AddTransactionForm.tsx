"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addTransaction } from "@/app/actions/finance";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { ALL_CATEGORIES, CATEGORY_LABEL } from "@/lib/finance";
import { todayLocalDate } from "@/lib/format";
import type { FinanceType } from "@/lib/types";

export function AddTransactionForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FinanceType>("expense");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add transaction
      </Button>
    );
  }

  const categories = type === "income" ? ["income" as const] : ALL_CATEGORIES.filter((c) => c !== "income");

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addTransaction(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex rounded-full bg-cream p-1">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                type === t ? "bg-pink text-white" : "text-charcoal-soft"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <input type="hidden" name="type" value={type} />

      <Input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="Amount" required />

      <Select key={type} name="category" defaultValue={categories[0]}>
        {categories.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABEL[c]}
          </option>
        ))}
      </Select>

      <Input name="description" placeholder="Description (optional)" maxLength={200} />

      <Input name="occurredOn" type="date" defaultValue={todayLocalDate()} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
