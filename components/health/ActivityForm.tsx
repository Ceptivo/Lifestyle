"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Plus, X, Camera } from "lucide-react";
import { addActivity } from "@/app/actions/health";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { parseWorkoutText, type ParsedWorkout } from "@/lib/workout-ocr";
import { todayLocalDate } from "@/lib/format";

const ACTIVITY_TYPES = [
  { type: "Run", icon: "footprints" },
  { type: "Strength", icon: "dumbbell" },
  { type: "Hyrox", icon: "flag" },
  { type: "Cycling", icon: "activity" },
  { type: "Swim", icon: "droplet" },
  { type: "Other", icon: "activity" },
];

export function ActivityForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState("Run");
  const [icon, setIcon] = useState("footprints");
  const [parsed, setParsed] = useState<ParsedWorkout | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [imageNotice, setImageNotice] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setOpen(true);
    setIsReadingImage(true);
    setImageNotice(null);

    try {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(file, "eng");
      const extracted = parseWorkoutText(result.data.text);

      if (!extracted.durationMinutes && !extracted.distanceKm && !extracted.calories && !extracted.notes) {
        setImageNotice("Couldn't read that image automatically — enter the details manually.");
      } else {
        setParsed(extracted);
        if (extracted.activityType) {
          const preset = ACTIVITY_TYPES.find((a) => a.type === extracted.activityType);
          setActivityType(extracted.activityType);
          if (preset) setIcon(preset.icon);
        }
        setFormVersion((v) => v + 1);
        setImageNotice("Auto-filled from the image — check the numbers before saving.");
      }
    } catch {
      setImageNotice("Couldn't read that image automatically — enter the details manually.");
    } finally {
      setIsReadingImage(false);
    }
  }

  if (!open) {
    return (
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)} className="flex-1">
          <Plus size={16} /> Log activity
        </Button>
        <label className="flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-pink-soft px-4 text-pink-dark">
          <Camera size={16} />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
      </div>
    );
  }

  return (
    <form
      key={formVersion}
      ref={formRef}
      action={(formData) => {
        formData.set("icon", icon);
        startTransition(async () => {
          await addActivity(formData);
          formRef.current?.reset();
          setTitle("");
          setActivityType("Run");
          setIcon("footprints");
          setParsed(null);
          setImageNotice(null);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">Log activity</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-pink-dark">
        <Camera size={15} />
        {isReadingImage ? "Reading image…" : "Attach a workout screenshot"}
        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isReadingImage} />
      </label>
      {imageNotice && <p className="text-xs text-charcoal-soft">{imageNotice}</p>}

      <Input name="title" placeholder="e.g. Morning run" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <Select
        name="activityType"
        value={activityType}
        onChange={(e) => {
          const t = e.target.value;
          setActivityType(t);
          const preset = ACTIVITY_TYPES.find((a) => a.type === t);
          if (preset) setIcon(preset.icon);
        }}
      >
        {ACTIVITY_TYPES.map((a) => (
          <option key={a.type} value={a.type}>
            {a.type}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-3 gap-2">
        <Input
          name="durationMinutes"
          type="number"
          inputMode="decimal"
          step="1"
          min="0"
          placeholder="Minutes"
          defaultValue={parsed?.durationMinutes ?? ""}
        />
        <Input
          name="distanceKm"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="Km"
          defaultValue={parsed?.distanceKm ?? ""}
        />
        <Input
          name="calories"
          type="number"
          inputMode="decimal"
          step="1"
          min="0"
          placeholder="Cal"
          defaultValue={parsed?.calories ?? ""}
        />
      </div>

      <Input name="performedOn" type="date" defaultValue={todayLocalDate()} required />
      <Input name="notes" placeholder="Notes (optional)" maxLength={200} defaultValue={parsed?.notes ?? ""} />
      <IconPicker name="icon" value={icon} onChange={setIcon} />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save activity"}
      </Button>
    </form>
  );
}
