"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addBudget } from "@/app/actions/finance-budgets";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

type Category = { id: string; name: string };

export function BudgetForm({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!categories.length) return null;

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add budget
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addBudget(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New budget</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Select name="categoryId" defaultValue={categories[0]?.id}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input name="monthlyLimit" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="Monthly limit" required />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save budget"}
      </Button>
    </form>
  );
}
