"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addMaintenanceTask } from "@/app/actions/environment";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { todayLocalDate } from "@/lib/format";

export function MaintenanceForm() {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState("wrench");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add maintenance task
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("icon", icon);
        startTransition(async () => {
          await addMaintenanceTask(formData);
          formRef.current?.reset();
          setIcon("wrench");
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New maintenance task</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="title" placeholder="e.g. Clean gutters" required />
      <Input name="notes" placeholder="Notes (optional)" />
      <div className="grid grid-cols-2 gap-2">
        <Input name="nextDueDate" type="date" defaultValue={todayLocalDate()} required />
        <Input name="intervalDays" type="number" min="1" step="1" placeholder="Repeat every N days" />
      </div>
      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save task"}
      </Button>
    </form>
  );
}
