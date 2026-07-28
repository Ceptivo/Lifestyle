"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addItineraryItem, deleteItineraryItem } from "@/app/actions/travel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export type ItineraryItem = { id: string; dateLabel: string; timeLabel: string | null; title: string; notes: string | null };

export function ItineraryList({ tripId, items }: { tripId: string; items: ItineraryItem[] }) {
  const [adding, setAdding] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      {items.length === 0 ? (
        <p className="mb-2 text-center text-sm text-charcoal-soft">No itinerary items yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal">{item.title}</p>
                <p className="text-xs text-charcoal-soft">
                  {item.dateLabel}
                  {item.timeLabel && ` · ${item.timeLabel}`}
                </p>
                {item.notes && <p className="text-xs text-charcoal-soft">{item.notes}</p>}
              </div>
              <form action={deleteItineraryItem.bind(null, item.id)}>
                <button type="submit" aria-label="Delete item" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                  <Trash2 size={13} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {!adding ? (
        <Button onClick={() => setAdding(true)} variant="secondary" className="mt-2 w-full">
          <Plus size={16} /> Add itinerary item
        </Button>
      ) : (
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await addItineraryItem(tripId, formData);
              formRef.current?.reset();
              setAdding(false);
            });
          }}
          className="mt-2 space-y-2 rounded-xl border border-border bg-cream p-3"
        >
          <Input name="title" placeholder="What's happening" required />
          <div className="grid grid-cols-2 gap-2">
            <Input name="itemDate" type="date" required />
            <Input name="itemTime" type="time" placeholder="Time (optional)" />
          </div>
          <Input name="notes" placeholder="Notes (optional)" />
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving…" : "Add"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
