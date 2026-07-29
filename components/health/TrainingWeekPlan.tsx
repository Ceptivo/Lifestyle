"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { addTrainingPlanItem, updateTrainingPlanItem, deleteTrainingPlanItem } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { Icon } from "@/components/ui/Icon";
import { DAY_LABELS } from "@/lib/health";

export type PlanItem = { id: string; dayOfWeek: number; title: string; description: string | null; icon: string };

function ItemForm({ dayOfWeek, item, onDone }: { dayOfWeek: number; item?: PlanItem; onDone: () => void }) {
  const [icon, setIcon] = useState(item?.icon ?? "dumbbell");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          if (item) {
            await updateTrainingPlanItem(item.id, formData);
          } else {
            await addTrainingPlanItem(formData);
          }
          onDone();
        });
      }}
      className="space-y-2.5 rounded-2xl border border-border bg-cream p-3.5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{item ? "Edit session" : "Add session"}</p>
        <button type="button" onClick={onDone} aria-label="Cancel" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={16} />
        </button>
      </div>
      <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
      <Input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. Legs + 2km run" required />
      <Input name="description" defaultValue={item?.description ?? ""} placeholder="Notes (optional)" />
      <IconPicker name="icon" value={icon} onChange={setIcon} />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function ItemRow({ item, onEdit }: { item: PlanItem; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={item.icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{item.title}</p>
        {item.description && <p className="break-words hyphens-auto text-xs text-charcoal-soft">{item.description}</p>}
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit session"
        className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => deleteTrainingPlanItem(item.id))}
        aria-label="Delete session"
        className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function DaySection({ dayOfWeek, items }: { dayOfWeek: number; items: PlanItem[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{DAY_LABELS[dayOfWeek]}</p>

      {items.length === 0 && !adding && <p className="mb-1.5 text-sm text-charcoal-soft">Rest / not planned</p>}

      {items.length > 0 && (
        <div className="divide-y divide-border">
          {items.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="py-1.5">
                <ItemForm dayOfWeek={dayOfWeek} item={item} onDone={() => setEditingId(null)} />
              </div>
            ) : (
              <ItemRow key={item.id} item={item} onEdit={() => setEditingId(item.id)} />
            )
          )}
        </div>
      )}

      {adding ? (
        <div className="mt-2">
          <ItemForm dayOfWeek={dayOfWeek} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex items-center gap-1 text-xs font-semibold text-pink-dark"
        >
          <Plus size={13} /> Add session
        </button>
      )}
    </div>
  );
}

export function TrainingWeekPlan({ items }: { items: PlanItem[] }) {
  return (
    <Card className="divide-y divide-border">
      {Array.from({ length: 7 }, (_, dayOfWeek) => (
        <DaySection key={dayOfWeek} dayOfWeek={dayOfWeek} items={items.filter((i) => i.dayOfWeek === dayOfWeek)} />
      ))}
    </Card>
  );
}
