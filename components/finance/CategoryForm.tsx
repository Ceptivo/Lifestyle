"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addCategory } from "@/app/actions/finance-categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { DEFAULT_ICON } from "@/lib/icons";
import type { FinanceType } from "@/lib/types";

export function CategoryForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FinanceType>("expense");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add category
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addCategory(formData);
          formRef.current?.reset();
          setType("expense");
          setIcon(DEFAULT_ICON);
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
                type === t ? "bg-pink text-ink font-semibold" : "text-charcoal-soft"
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

      <Input name="name" placeholder="Category name" required />
      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save category"}
      </Button>
    </form>
  );
}
