"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, Pencil, Trash2, X } from "lucide-react";
import { updateReminder, toggleReminderHome, deleteReminder } from "@/app/actions/reminders";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ReminderPriority } from "@/lib/types";

const PRIORITY_LABEL: Record<ReminderPriority, string> = {
  urgent: "Urgent",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_CLASS: Record<ReminderPriority, string> = {
  urgent: "bg-danger-soft text-danger",
  medium: "bg-pink-soft text-pink-dark",
  low: "bg-cream text-charcoal-soft",
};

export type Reminder = {
  id: string;
  title: string;
  description: string | null;
  priority: ReminderPriority;
  remindAt: string | null;
  remindAtFormatted: string | null;
  showOnHome: boolean;
  displayStart: string | null;
  displayEnd: string | null;
};

export type ReminderPriorityGroup = { priority: ReminderPriority; reminders: Reminder[] };

// datetime-local inputs need "YYYY-MM-DDTHH:mm" — trim the seconds off the
// stored "timestamp" (no time zone) value.
function toInputValue(value: string | null): string {
  return value ? value.slice(0, 16) : "";
}

function ReminderEditForm({ reminder, onDone }: { reminder: Reminder; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updateReminder(reminder.id, formData);
          onDone();
        });
      }}
      className="mt-2 space-y-2"
    >
      <Input name="title" defaultValue={reminder.title} required className="text-sm" />
      <Select name="priority" defaultValue={reminder.priority} className="text-sm">
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="urgent">Urgent</option>
      </Select>
      <Textarea name="description" defaultValue={reminder.description ?? ""} placeholder="Description (optional)" rows={2} className="text-sm" />
      <Input name="remindAt" type="datetime-local" defaultValue={toInputValue(reminder.remindAt)} className="text-sm" />
      <div className="flex gap-2">
        <Input name="displayStart" type="datetime-local" defaultValue={toInputValue(reminder.displayStart)} placeholder="Show from" className="flex-1 text-sm" />
        <Input name="displayEnd" type="datetime-local" defaultValue={toInputValue(reminder.displayEnd)} placeholder="Show until" className="flex-1 text-sm" />
      </div>
      <div className="flex gap-1.5">
        <Button type="submit" disabled={isPending} className="h-8 flex-1 px-3 py-1.5 text-xs">
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone} className="h-8 px-3 py-1.5 text-xs">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  return (
    <Card className={cn("flex items-start gap-3 px-4 py-3.5", reminder.priority === "urgent" && "border-danger/40 bg-danger-soft")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{reminder.title}</p>
          <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", PRIORITY_CLASS[reminder.priority])}>
            {PRIORITY_LABEL[reminder.priority]}
          </span>
        </div>
        {reminder.remindAtFormatted && <p className="text-xs text-charcoal-soft">Reminder set for {reminder.remindAtFormatted}</p>}
        {reminder.description && <p className="mt-0.5 break-words text-xs text-charcoal-soft">{reminder.description}</p>}
        {reminder.showOnHome && (
          <p className="mt-0.5 text-xs font-medium text-pink-dark">
            On Home screen
            {reminder.displayStart || reminder.displayEnd
              ? ` · ${reminder.displayStart ? toInputValue(reminder.displayStart).replace("T", " ") : "now"} → ${reminder.displayEnd ? toInputValue(reminder.displayEnd).replace("T", " ") : "always"}`
              : ""}
          </p>
        )}

        {editing && <ReminderEditForm reminder={reminder} onDone={() => setEditing(false)} />}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-label={editing ? "Cancel edit" : "Edit reminder"}
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            {editing ? <X size={14} /> : <Pencil size={13} />}
          </button>
          <form action={deleteReminder.bind(null, reminder.id)}>
            <button type="submit" aria-label="Delete reminder" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => toggleReminderHome(reminder.id, !reminder.showOnHome))}
          aria-label={reminder.showOnHome ? "Remove from Home screen" : "Show on Home screen"}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
            reminder.showOnHome ? "bg-pink text-ink" : "bg-cream text-charcoal-soft"
          )}
        >
          {reminder.showOnHome ? <Bell size={12} /> : <BellOff size={12} />}
          {reminder.showOnHome ? "On Home" : "Show on Home"}
        </button>
      </div>
    </Card>
  );
}

export function ReminderList({ groups }: { groups: ReminderPriorityGroup[] }) {
  const hasAny = groups.some((g) => g.reminders.length > 0);
  if (!hasAny) {
    return <p className="text-center text-sm text-charcoal-soft">No reminders yet. Add your first one.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.priority}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">{PRIORITY_LABEL[g.priority]}</h3>
          <ul className="space-y-2">
            {g.reminders.map((r) => (
              <li key={r.id}>
                <ReminderRow reminder={r} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
