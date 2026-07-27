"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { updatePersonTarget } from "@/app/actions/social";
import { Input, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function CadenceEditor({
  personId,
  targetCount,
  periodDays,
  notes,
}: {
  personId: string;
  targetCount: number;
  periodDays: number;
  notes: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-dark"
      >
        <Pencil size={12} /> Edit goal
      </button>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updatePersonTarget(personId, formData);
          setEditing(false);
        });
      }}
      className="space-y-2.5 rounded-2xl border border-border bg-cream p-3.5"
    >
      <div className="flex items-center justify-between">
        <Label>Keep-in-touch goal</Label>
        <button type="button" onClick={() => setEditing(false)} aria-label="Cancel" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input name="targetCount" type="number" min="1" step="1" defaultValue={targetCount} placeholder="Times" />
        <Input name="periodDays" type="number" min="1" step="1" defaultValue={periodDays} placeholder="Per days" />
      </div>
      <Input name="notes" defaultValue={notes ?? ""} placeholder="Notes (optional)" />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
