"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2 } from "lucide-react";
import { markVehicleReminderDone, deleteVehicleReminder } from "@/app/actions/vehicle";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { VehicleReminderCategory } from "@/lib/types";

const CATEGORY_LABEL: Record<VehicleReminderCategory, string> = { maintenance: "Maintenance", insurance: "Insurance", license: "License" };
const CATEGORY_CLASS: Record<VehicleReminderCategory, string> = {
  maintenance: "bg-pink-soft text-pink-dark",
  insurance: "bg-cream text-charcoal-soft",
  license: "bg-orange-500/15 text-orange-600",
};

export type VehicleReminder = {
  id: string;
  category: VehicleReminderCategory;
  title: string;
  notes: string | null;
  provider: string | null;
  dueDateFormatted: string;
  icon: string;
  overdue: boolean;
};

function ReminderRow({ reminder }: { reminder: VehicleReminder }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className={cn("flex items-start gap-3 px-4 py-3.5", reminder.overdue && "border-danger/40 bg-danger-soft")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={reminder.icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="break-words text-sm font-medium text-charcoal">{reminder.title}</p>
          <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", CATEGORY_CLASS[reminder.category])}>
            {CATEGORY_LABEL[reminder.category]}
          </span>
        </div>
        <p className={cn("text-xs", reminder.overdue ? "font-semibold text-danger" : "text-charcoal-soft")}>
          Due {reminder.dueDateFormatted}
          {reminder.provider && ` · ${reminder.provider}`}
          {reminder.overdue && " · overdue"}
        </p>
        {reminder.notes && <p className="mt-0.5 text-xs text-charcoal-soft">{reminder.notes}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await markVehicleReminderDone(reminder.id);
              router.refresh();
            })
          }
          aria-label="Mark done"
          className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-emerald-600"
        >
          <CheckCircle2 size={16} />
        </button>
        <form action={deleteVehicleReminder.bind(null, reminder.id)}>
          <button type="submit" aria-label="Delete reminder" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
            <Trash2 size={14} />
          </button>
        </form>
      </div>
    </Card>
  );
}

export function VehicleReminderList({ reminders }: { reminders: VehicleReminder[] }) {
  if (!reminders.length) return <p className="text-center text-sm text-charcoal-soft">No reminders yet. Add maintenance, insurance, or license renewal dates.</p>;

  return (
    <ul className="space-y-2">
      {reminders.map((r) => (
        <li key={r.id}>
          <ReminderRow reminder={r} />
        </li>
      ))}
    </ul>
  );
}
