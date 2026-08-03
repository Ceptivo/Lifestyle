"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addAssignment } from "@/app/actions/university-calendar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

export type ModuleOption = { id: string; code: string; name: string };

export function AssignmentForm({ modules }: { modules: ModuleOption[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add assignment
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addAssignment(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New assignment</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="title" placeholder="Assignment title" required />
      <Select name="moduleId" defaultValue="" required>
        <option value="" disabled>
          Module
        </option>
        {modules.map((m) => (
          <option key={m.id} value={m.id}>
            {m.code} — {m.name}
          </option>
        ))}
      </Select>
      <Input name="dueDate" type="date" required />
      <Input name="notes" placeholder="Notes (optional)" />
      <label className="flex items-center gap-2 text-sm text-charcoal-soft">
        <input type="checkbox" name="flagged" className="h-4 w-4 rounded border-border text-pink accent-pink" />
        Flag as important
      </label>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save assignment"}
      </Button>
    </form>
  );
}
