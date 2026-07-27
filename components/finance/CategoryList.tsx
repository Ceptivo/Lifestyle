"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { updateCategory, deleteCategory } from "@/app/actions/finance-categories";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { Icon } from "@/components/ui/Icon";
import type { FinanceType } from "@/lib/types";

type Category = { id: string; name: string; icon: string; type: FinanceType };

function CategoryCard({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [icon, setIcon] = useState(category.icon);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card className="px-4 py-3.5">
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await updateCategory(category.id, formData);
              setEditing(false);
            });
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Edit category</p>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Cancel"
              className="p-1 text-charcoal-soft hover:text-charcoal"
            >
              <X size={18} />
            </button>
          </div>
          <Input name="name" defaultValue={category.name} required />
          <IconPicker name="icon" value={icon} onChange={setIcon} />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={category.icon} size={16} />
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal">{category.name}</p>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Edit category"
        className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <Pencil size={14} />
      </button>
      <form action={deleteCategory.bind(null, category.id)}>
        <button
          type="submit"
          aria-label="Delete category"
          className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-pink"
        >
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  if (!categories.length) {
    return <p className="text-center text-sm text-charcoal-soft">No categories yet. Add your first one.</p>;
  }

  return (
    <div className="space-y-6">
      {expense.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Expense</h2>
          <ul className="space-y-2">
            {expense.map((category) => (
              <li key={category.id}>
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {income.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Income</h2>
          <ul className="space-y-2">
            {income.map((category) => (
              <li key={category.id}>
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
