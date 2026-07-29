"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSpecial } from "@/app/actions/restaurant-savers";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { DayOfWeek } from "@/lib/types";

const DAY_TABS: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export type SpecialItem = {
  id: string;
  dayOfWeek: DayOfWeek;
  restaurantName: string;
  itemName: string;
  icon: string;
  priceLabel: string | null;
  notes: string | null;
};

function Row({ item }: { item: SpecialItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={item.icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{item.itemName}</p>
        <p className="text-xs text-charcoal-soft">
          {[item.restaurantName, item.priceLabel].filter(Boolean).join(" · ")}
        </p>
        {item.notes && <p className="text-xs text-charcoal-soft">{item.notes}</p>}
      </div>
      <form
        action={() =>
          startTransition(async () => {
            await deleteSpecial(item.id);
          })
        }
      >
        <button type="submit" disabled={isPending} aria-label="Delete special" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function SpecialsByDay({ items, defaultDay }: { items: SpecialItem[]; defaultDay: DayOfWeek }) {
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const dayItems = items.filter((i) => i.dayOfWeek === day);

  return (
    <div>
      <div className="mb-4 flex gap-1.5 overflow-x-auto">
        {DAY_TABS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setDay(d.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              day === d.value ? "bg-pink text-ink font-semibold" : "bg-paper text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>
      {dayItems.length === 0 ? (
        <p className="text-center text-sm text-charcoal-soft">No specials logged for this day yet.</p>
      ) : (
        <ul className="space-y-2">
          {dayItems.map((item) => (
            <li key={item.id}>
              <Row item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
