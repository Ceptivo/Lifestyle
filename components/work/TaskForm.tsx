"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addTask } from "@/app/actions/work";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

export function TaskForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add task
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addTask(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New task</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="title" placeholder="Task title" required />
      <Input name="notes" placeholder="Notes (optional)" />
      <Input name="dueDate" type="date" />
      <Select name="priority" defaultValue="medium">
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="high">High priority</option>
      </Select>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save task"}
      </Button>
    </form>
  );
}
