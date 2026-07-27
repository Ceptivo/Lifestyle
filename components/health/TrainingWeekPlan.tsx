"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { saveTrainingDay } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { Icon } from "@/components/ui/Icon";
import { DAY_LABELS } from "@/lib/health";

type DayPlan = { dayOfWeek: number; title: string; description: string | null; icon: string } | null;

function DayRow({ weekStartDate, dayOfWeek, plan }: { weekStartDate: string; dayOfWeek: number; plan: DayPlan }) {
  const [editing, setEditing] = useState(false);
  const [icon, setIcon] = useState(plan?.icon ?? "dumbbell");
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-center gap-3 py-2.5">
        <span className="w-9 shrink-0 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
          {DAY_LABELS[dayOfWeek].slice(0, 3)}
        </span>
        {plan ? (
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={plan.icon} size={14} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-charcoal">{plan.title}</p>
              {plan.description && <p className="truncate text-xs text-charcoal-soft">{plan.description}</p>}
            </div>
          </div>
        ) : (
          <p className="flex-1 text-sm text-charcoal-soft">Rest / not planned</p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit day"
          className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
        >
          <Pencil size={14} />
        </button>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await saveTrainingDay(formData);
          setEditing(false);
        });
      }}
      className="space-y-2.5 rounded-2xl border border-border bg-cream p-3.5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{DAY_LABELS[dayOfWeek]}</p>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Cancel"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={16} />
        </button>
      </div>
      <input type="hidden" name="weekStartDate" value={weekStartDate} />
      <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
      <Input name="title" defaultValue={plan?.title ?? ""} placeholder="e.g. Legs + 2km run" />
      <Input name="description" defaultValue={plan?.description ?? ""} placeholder="Notes (optional)" />
      <IconPicker name="icon" value={icon} onChange={setIcon} />
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function TrainingWeekPlan({ weekStartDate, plans }: { weekStartDate: string; plans: Record<number, DayPlan> }) {
  return (
    <Card className="divide-y divide-border">
      {Array.from({ length: 7 }, (_, dayOfWeek) => (
        <DayRow key={dayOfWeek} weekStartDate={weekStartDate} dayOfWeek={dayOfWeek} plan={plans[dayOfWeek] ?? null} />
      ))}
    </Card>
  );
}
