"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addHealthGoal } from "@/app/actions/health";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function HealthGoalForm() {
  const [open, setOpen] = useState(false);
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
          await addHealthGoal(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New health goal</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Goal (e.g. Sub-1:30 Hyrox)" required />
      <Input name="description" placeholder="Details (optional)" />
      <Input name="targetDate" type="date" placeholder="Target date (optional)" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save goal"}
      </Button>
    </form>
  );
}
