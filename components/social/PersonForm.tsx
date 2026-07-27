"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addPerson } from "@/app/actions/social";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";

export function PersonForm() {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState("user");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add person
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("icon", icon);
        startTransition(async () => {
          await addPerson(formData);
          formRef.current?.reset();
          setIcon("user");
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New person</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Name" required />
      <Input name="relationshipType" placeholder="Relationship (e.g. friend, family, partner)" defaultValue="friend" />

      <div className="grid grid-cols-2 gap-2">
        <Input name="targetCount" type="number" min="1" step="1" defaultValue={2} placeholder="Times" />
        <Input name="periodDays" type="number" min="1" step="1" defaultValue={30} placeholder="Per days" />
      </div>
      <p className="text-xs text-charcoal-soft">e.g. 2 times per 30 days — how often you want to stay in touch.</p>

      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save person"}
      </Button>
    </form>
  );
}
