"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addPackingItem, togglePackingItem, deletePackingItem } from "@/app/actions/travel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export type PackingItem = { id: string; name: string; category: string | null; packed: boolean };

function Row({ item }: { item: PackingItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className="flex items-center gap-2.5 py-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => togglePackingItem(item.id))}
        aria-label={item.packed ? "Mark unpacked" : "Mark packed"}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[10px] transition-colors",
          item.packed ? "border-pink bg-pink text-ink" : "border-border text-transparent"
        )}
      >
        ✓
      </button>
      <span className={cn("min-w-0 flex-1 break-words hyphens-auto text-sm", item.packed ? "text-charcoal-soft line-through" : "text-charcoal")}>
        {item.name}
      </span>
      <form action={deletePackingItem.bind(null, item.id)}>
        <button type="submit" aria-label="Delete item" className="shrink-0 rounded-full p-1 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={13} />
        </button>
      </form>
    </li>
  );
}

export function PackingList({ tripId, items }: { tripId: string; items: PackingItem[] }) {
  const [adding, setAdding] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const grouped = new Map<string, PackingItem[]>();
  for (const item of items) {
    const key = item.category ?? "Other";
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  return (
    <Card>
      {items.length === 0 && <p className="mb-2 text-center text-sm text-charcoal-soft">Nothing on the packing list yet.</p>}
      {[...grouped.entries()].map(([category, catItems]) => (
        <div key={category} className="mb-2 last:mb-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{category}</p>
          <ul className="divide-y divide-border">
            {catItems.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
        </div>
      ))}

      {!adding ? (
        <Button onClick={() => setAdding(true)} variant="secondary" className="mt-2 w-full">
          <Plus size={16} /> Add item
        </Button>
      ) : (
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await addPackingItem(tripId, formData);
              formRef.current?.reset();
              setAdding(false);
            });
          }}
          className="mt-2 space-y-2 rounded-xl border border-border bg-cream p-3"
        >
          <Input name="name" placeholder="Item" required />
          <Input name="category" placeholder="Category (optional, e.g. Clothing)" />
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
