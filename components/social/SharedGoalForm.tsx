"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addSharedGoal } from "@/app/actions/social";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

type Person = { id: string; name: string };

export function SharedGoalForm({ people }: { people: Person[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add shared goal
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addSharedGoal(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New shared goal</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Goal (e.g. Weekend trip to the coast)" required />
      <Input name="description" placeholder="Details (optional)" />

      {people.length > 0 && (
        <Select name="personId" defaultValue="">
          <option value="">Not tied to a specific person</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      )}

      <Input name="targetDate" type="date" placeholder="Target date (optional)" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save goal"}
      </Button>
    </form>
  );
}
