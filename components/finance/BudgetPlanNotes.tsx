"use client";

import { useState, useTransition } from "react";
import { BookOpen, X } from "lucide-react";
import { updateBudgetNotes } from "@/app/actions/finance-budget-notes";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function BudgetPlanNotes({ initialContent }: { initialContent: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-charcoal">Budgets</h1>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Budget plan notes"
          aria-expanded={open}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark hover:bg-pink-soft/70"
        >
          <BookOpen size={16} />
        </button>
      </div>

      {open && (
        <div className="mb-6 rounded-2xl border border-border bg-paper p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Budget plan</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 text-charcoal-soft hover:text-charcoal"
            >
              <X size={18} />
            </button>
          </div>
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateBudgetNotes(formData);
              });
            }}
            className="space-y-3"
          >
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="text-xs"
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
