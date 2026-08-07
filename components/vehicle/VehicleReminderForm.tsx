"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addVehicleReminder } from "@/app/actions/vehicle";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { todayLocalDate } from "@/lib/format";

const DEFAULT_ICON: Record<string, string> = { maintenance: "wrench", insurance: "shield", license: "calendar-days" };

export function VehicleReminderForm({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("maintenance");
  const [icon, setIcon] = useState(DEFAULT_ICON.maintenance);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add reminder
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("icon", icon);
        startTransition(async () => {
          await addVehicleReminder(formData);
          formRef.current?.reset();
          setCategory("maintenance");
          setIcon(DEFAULT_ICON.maintenance);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New reminder</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Select
        name="category"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setIcon(DEFAULT_ICON[e.target.value] ?? "wrench");
        }}
      >
        <option value="maintenance">Maintenance</option>
        <option value="insurance">Insurance</option>
        <option value="license">License renewal</option>
      </Select>

      <Input name="title" placeholder="e.g. Oil change, Outsurance, Vehicle license" required />
      {category === "insurance" && <Input name="provider" placeholder="Provider (optional)" />}
      <Input name="notes" placeholder="Notes (optional)" />
      <div className="flex gap-2">
        <Input name="nextDueDate" type="date" defaultValue={todayLocalDate()} required className="flex-1" />
        <Input name="intervalDays" type="number" min="1" step="1" placeholder="Repeats every N days (e.g. 365)" className="flex-1" />
      </div>
      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save reminder"}
      </Button>
    </form>
  );
}
