"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addActivity } from "@/app/actions/health";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { todayLocalDate } from "@/lib/format";

const ACTIVITY_TYPES = [
  { type: "Run", icon: "footprints" },
  { type: "Strength", icon: "dumbbell" },
  { type: "Hyrox", icon: "flag" },
  { type: "Cycling", icon: "activity" },
  { type: "Swim", icon: "droplet" },
  { type: "Other", icon: "activity" },
];

export function ActivityForm() {
  const [open, setOpen] = useState(false);
  const [activityType, setActivityType] = useState("Run");
  const [icon, setIcon] = useState("footprints");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Log activity
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("icon", icon);
        startTransition(async () => {
          await addActivity(formData);
          formRef.current?.reset();
          setActivityType("Run");
          setIcon("footprints");
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">Log activity</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Input name="title" placeholder="e.g. Morning run" required />

      <Select
        name="activityType"
        value={activityType}
        onChange={(e) => {
          const t = e.target.value;
          setActivityType(t);
          const preset = ACTIVITY_TYPES.find((a) => a.type === t);
          if (preset) setIcon(preset.icon);
        }}
      >
        {ACTIVITY_TYPES.map((a) => (
          <option key={a.type} value={a.type}>
            {a.type}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-3 gap-2">
        <Input name="durationMinutes" type="number" inputMode="decimal" step="1" min="0" placeholder="Minutes" />
        <Input name="distanceKm" type="number" inputMode="decimal" step="0.01" min="0" placeholder="Km" />
        <Input name="calories" type="number" inputMode="decimal" step="1" min="0" placeholder="Cal" />
      </div>

      <Input name="performedOn" type="date" defaultValue={todayLocalDate()} required />
      <Input name="notes" placeholder="Notes (optional)" maxLength={200} />
      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save activity"}
      </Button>
    </form>
  );
}
