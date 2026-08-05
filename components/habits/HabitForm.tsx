"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addHabit } from "@/app/actions/habits";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";

export function HabitForm() {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState("target");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add habit
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("icon", icon);
        startTransition(async () => {
          await addHabit(formData);
          formRef.current?.reset();
          setIcon("target");
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New habit</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="e.g. Drink 2L of water" required />
      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save habit"}
      </Button>
    </form>
  );
}
