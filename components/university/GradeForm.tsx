"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addGrade } from "@/app/actions/university";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function GradeForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add grade
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addGrade(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New grade</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="subject" placeholder="Subject" required />
      <Input name="term" placeholder="Term (e.g. Semester 1 2026)" required />
      <Input name="assessment" placeholder="Assessment (e.g. Assignment 1)" required />
      <div className="flex gap-2">
        <Input name="mark" type="number" inputMode="decimal" step="0.1" placeholder="Mark" required className="flex-1" />
        <Input name="maxMark" type="number" inputMode="decimal" step="0.1" defaultValue={100} placeholder="Out of" className="flex-1" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save grade"}
      </Button>
    </form>
  );
}
