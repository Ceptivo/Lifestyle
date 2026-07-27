"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addJournalEntry } from "@/app/actions/health";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { todayLocalDate } from "@/lib/format";

export function JournalEntryForm() {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState(5);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Log entry
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addJournalEntry(formData);
          formRef.current?.reset();
          setSeverity(5);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">Log entry</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Input name="symptom" placeholder="Symptom (e.g. Lower back pain)" required />
      <Input name="bodyArea" placeholder="Body area (optional)" />

      <div>
        <Label>Severity: {severity}/10</Label>
        <input
          type="range"
          name="severity"
          min={1}
          max={10}
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="w-full accent-pink"
        />
      </div>

      <Input name="triggers" placeholder="Possible triggers (optional)" />
      <Input name="notes" placeholder="Notes (optional)" maxLength={300} />
      <Input name="entryDate" type="date" defaultValue={todayLocalDate()} required />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save entry"}
      </Button>
    </form>
  );
}
