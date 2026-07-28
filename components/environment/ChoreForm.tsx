"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addChore } from "@/app/actions/environment";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function ChoreForm() {
  const [open, setOpen] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add chore
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addChore(formData);
          formRef.current?.reset();
          setRecurring(false);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New chore</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="title" placeholder="e.g. Take out the trash" required />
      <Input name="notes" placeholder="Notes (optional)" />

      <label className="flex items-center gap-2 text-sm text-charcoal-soft">
        <input type="checkbox" name="recurring" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-pink" />
        Repeats
      </label>
      {recurring && <Input name="intervalDays" type="number" min="1" step="1" placeholder="Every N days" />}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save chore"}
      </Button>
    </form>
  );
}
