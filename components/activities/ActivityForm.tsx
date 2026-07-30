"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addActivity } from "@/app/actions/activities";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

export function ActivityForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add activity
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addActivity(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New activity</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="What do you want to do?" required />
      <div className="grid grid-cols-2 gap-2">
        <Input name="location" placeholder="Location (optional)" />
        <Input name="costEstimate" type="number" inputMode="decimal" step="0.01" min="0" placeholder="Est. cost (optional)" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Select name="locationType" defaultValue="outdoor">
          <option value="outdoor">Outdoor</option>
          <option value="indoor">Indoor</option>
        </Select>
        <Select name="physicalType" defaultValue="physical">
          <option value="physical">Physical</option>
          <option value="non_physical">Non-physical</option>
        </Select>
        <Select name="costTier" defaultValue="cheap">
          <option value="cheap">Cheap</option>
          <option value="expensive">Expensive</option>
        </Select>
      </div>
      <Input name="notes" placeholder="Notes (optional)" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
