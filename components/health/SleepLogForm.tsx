"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addSleepLog } from "@/app/actions/health";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { todayLocalDate } from "@/lib/format";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

function RatingPicker({ name, value, onChange }: { name: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5">
      <input type="hidden" name={name} value={value ?? ""} />
      {RATING_OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-9 flex-1 rounded-lg text-sm font-semibold transition-colors ${
            value === n ? "bg-pink text-ink" : "bg-cream text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function SleepLogForm() {
  const [open, setOpen] = useState(false);
  const [quality, setQuality] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Log sleep
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addSleepLog(formData);
          formRef.current?.reset();
          setQuality(null);
          setMood(null);
          setEnergy(null);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">Log sleep</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <Label htmlFor="sleepDate">Night of</Label>
        <Input id="sleepDate" name="sleepDate" type="date" defaultValue={todayLocalDate()} required />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input name="bedtime" type="time" placeholder="Bedtime" />
        <Input name="wakeTime" type="time" placeholder="Wake time" />
      </div>

      <Input name="durationHours" type="number" inputMode="decimal" step="0.1" min="0" max="24" placeholder="Hours slept" />

      <div>
        <Label>Sleep quality (1-5)</Label>
        <RatingPicker name="qualityRating" value={quality} onChange={setQuality} />
      </div>
      <div>
        <Label>Mood next day (1-5)</Label>
        <RatingPicker name="moodNextDay" value={mood} onChange={setMood} />
      </div>
      <div>
        <Label>Energy next day (1-5)</Label>
        <RatingPicker name="energyNextDay" value={energy} onChange={setEnergy} />
      </div>

      <Input name="notes" placeholder="Notes (optional)" maxLength={200} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save sleep log"}
      </Button>
    </form>
  );
}
