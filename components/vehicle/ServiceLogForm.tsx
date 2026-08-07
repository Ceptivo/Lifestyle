"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addServiceLog } from "@/app/actions/vehicle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { todayLocalDate } from "@/lib/format";

export function ServiceLogForm({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Log a service
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addServiceLog(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New service record</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="serviceDate" type="date" defaultValue={todayLocalDate()} required />
      <Input name="description" placeholder="What was done (e.g. Oil & filter change)" required />
      <div className="flex gap-2">
        <Input name="odometerKm" type="number" inputMode="numeric" placeholder="Odometer (km)" className="flex-1" />
        <Input name="cost" type="number" inputMode="decimal" step="0.01" placeholder="Cost (optional)" className="flex-1" />
      </div>
      <Input name="workshop" placeholder="Workshop (optional)" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save record"}
      </Button>
    </form>
  );
}
