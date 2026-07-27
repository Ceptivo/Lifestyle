"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addOccasion } from "@/app/actions/social";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";

type Person = { id: string; name: string };

export function OccasionForm({ people }: { people: Person[] }) {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState("gift");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} disabled={!people.length} className="w-full">
        <Plus size={16} /> Add occasion
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("icon", icon);
        startTransition(async () => {
          await addOccasion(formData);
          formRef.current?.reset();
          setIcon("gift");
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New occasion</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Select name="personId" defaultValue={people[0]?.id ?? ""}>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>

      <Input name="label" placeholder="Occasion (e.g. Birthday, Anniversary)" required />
      <Input name="occasionDate" type="date" required />

      <label className="flex items-center gap-2 text-sm text-charcoal-soft">
        <input type="checkbox" name="recurring" defaultChecked className="accent-pink" />
        Repeats every year
      </label>

      <div>
        <Label htmlFor="giftIdeas">Gift ideas</Label>
        <Input id="giftIdeas" name="giftIdeas" placeholder="Optional" />
      </div>

      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending || !people.length} className="w-full">
        {isPending ? "Saving…" : "Save occasion"}
      </Button>
    </form>
  );
}
