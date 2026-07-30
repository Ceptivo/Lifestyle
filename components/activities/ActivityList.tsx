"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleActivityDone, deleteActivity } from "@/app/actions/activities";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { ActivityLocationType, ActivityPhysicalType, ActivityCostTier } from "@/lib/types";

export type ActivityItem = {
  id: string;
  name: string;
  icon: string;
  done: boolean;
  location: string | null;
  costLabel: string | null;
  notes: string | null;
  locationType: ActivityLocationType;
  physicalType: ActivityPhysicalType;
  costTier: ActivityCostTier;
};

const TAG_LABEL: Record<string, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  physical: "Physical",
  non_physical: "Non-physical",
  cheap: "Cheap",
  expensive: "Expensive",
};

function Tag({ value }: { value: string }) {
  return (
    <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal-soft">
      {TAG_LABEL[value] ?? value}
    </span>
  );
}

function Row({ item }: { item: ActivityItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleActivityDone(item.id))}
        aria-label={item.done ? "Mark not done" : "Mark done"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          item.done ? "bg-pink text-ink" : "bg-pink-soft text-pink-dark"
        )}
      >
        <Icon name={item.icon} size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("break-words hyphens-auto text-sm font-medium", item.done ? "text-charcoal-soft line-through" : "text-charcoal")}>{item.name}</p>
        <p className="text-xs text-charcoal-soft">
          {[item.location, item.costLabel].filter(Boolean).join(" · ") || "No location or estimate"}
        </p>
        {item.notes && <p className="text-xs text-charcoal-soft">{item.notes}</p>}
        <div className="mt-1.5 flex flex-wrap gap-1">
          <Tag value={item.locationType} />
          <Tag value={item.physicalType} />
          <Tag value={item.costTier} />
        </div>
      </div>
      <form action={deleteActivity.bind(null, item.id)}>
        <button type="submit" aria-label="Delete activity" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function ActivityList({ items, emptyMessage = "No activities yet — add something to do." }: { items: ActivityItem[]; emptyMessage?: string }) {
  if (!items.length) {
    return <p className="text-center text-sm text-charcoal-soft">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Row item={item} />
        </li>
      ))}
    </ul>
  );
}
