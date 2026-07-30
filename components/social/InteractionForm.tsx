"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addInteraction } from "@/app/actions/social";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { todayLocalDate } from "@/lib/format";

const TYPES = ["Meet up", "Dinner", "Breakfast", "Lunch", "Call", "Video", "Text", "Other"];

export function InteractionForm({ personId }: { personId: string }) {
  const [open, setOpen] = useState(false);
  const [interactionType, setInteractionType] = useState("Meet up");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Log interaction
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addInteraction(personId, formData);
          formRef.current?.reset();
          setInteractionType("Meet up");
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">Log interaction</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Select name="interactionType" value={interactionType} onChange={(e) => setInteractionType(e.target.value)}>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <Input name="occurredOn" type="date" defaultValue={todayLocalDate()} required />
      {interactionType === "Other" && <Input name="notes" placeholder="What was it?" maxLength={200} autoFocus />}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
