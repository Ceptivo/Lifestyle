"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addGoal } from "@/app/actions/finance-goals";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { DEFAULT_ICON } from "@/lib/icons";

export function GoalForm() {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add goal
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addGoal(formData);
          formRef.current?.reset();
          setIcon(DEFAULT_ICON);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New goal</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Goal name" required />
      <IconPicker name="icon" value={icon} onChange={setIcon} />
      <Input name="targetAmount" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="Target amount" required />
      <Input name="targetDate" type="date" placeholder="Target date (optional)" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save goal"}
      </Button>
    </form>
  );
}
