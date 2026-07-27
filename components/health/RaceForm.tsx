"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addRace } from "@/app/actions/health";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function RaceForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="secondary" className="w-full">
        <Plus size={16} /> Add race
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addRace(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New race</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Race name" required />
      <div className="grid grid-cols-2 gap-2">
        <Input name="discipline" placeholder="Discipline (e.g. Hyrox)" defaultValue="Hyrox" />
        <Input name="division" placeholder="Division (e.g. Men's Doubles)" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input name="ageGroup" placeholder="Age group (e.g. 19-25)" />
        <Input name="eventDate" type="date" required />
      </div>
      <Input name="location" placeholder="Location (optional)" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save race"}
      </Button>
    </form>
  );
}
