"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addNote } from "@/app/actions/work";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

export function MeetingNoteForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add meeting note
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addNote(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New meeting note</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="title" placeholder="Meeting title (e.g. Standup, 30 Jul)" required />
      <Textarea name="content" placeholder="Write your notes… press Enter for a new line, Enter twice for a blank line between points." rows={6} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save note"}
      </Button>
    </form>
  );
}
