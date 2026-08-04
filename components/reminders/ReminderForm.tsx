"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addReminder } from "@/app/actions/reminders";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label } from "@/components/ui/Field";

export function ReminderForm() {
  const [open, setOpen] = useState(false);
  const [showOnHome, setShowOnHome] = useState(false);
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
        startTransition(async () => {
          await addReminder(formData);
          formRef.current?.reset();
          setShowOnHome(false);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New reminder</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="title" placeholder="Reminder title" required />
      <Select name="priority" defaultValue="medium">
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="urgent">Urgent</option>
      </Select>
      <Textarea name="description" placeholder="Description (optional)" rows={2} />

      <div>
        <Label htmlFor="reminder-remind-at">Remind me at (optional)</Label>
        <Input id="reminder-remind-at" name="remindAt" type="datetime-local" />
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal-soft">
        <input
          type="checkbox"
          name="showOnHome"
          checked={showOnHome}
          onChange={(e) => setShowOnHome(e.target.checked)}
          className="h-4 w-4 rounded border-border text-pink accent-pink"
        />
        Show on Home screen
      </label>

      {showOnHome && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="reminder-display-start">Show from</Label>
            <Input id="reminder-display-start" name="displayStart" type="datetime-local" className="text-sm" />
          </div>
          <div className="flex-1">
            <Label htmlFor="reminder-display-end">Show until</Label>
            <Input id="reminder-display-end" name="displayEnd" type="datetime-local" className="text-sm" />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save reminder"}
      </Button>
    </form>
  );
}
