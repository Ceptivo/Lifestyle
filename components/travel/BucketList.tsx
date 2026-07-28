"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleBucketListAchieved, deleteBucketListItem } from "@/app/actions/travel";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type BucketListItem = {
  id: string;
  title: string;
  icon: string;
  achieved: boolean;
  targetDateLabel: string | null;
  costLabel: string | null;
  notes: string | null;
};

function Row({ item }: { item: BucketListItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleBucketListAchieved(item.id))}
        aria-label={item.achieved ? "Mark not achieved" : "Mark achieved"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          item.achieved ? "bg-pink text-ink" : "bg-pink-soft text-pink-dark"
        )}
      >
        <Icon name={item.icon} size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", item.achieved ? "text-charcoal-soft line-through" : "text-charcoal")}>{item.title}</p>
        <p className="text-xs text-charcoal-soft">
          {[item.targetDateLabel, item.costLabel].filter(Boolean).join(" · ") || "No target date or estimate"}
        </p>
        {item.notes && <p className="text-xs text-charcoal-soft">{item.notes}</p>}
      </div>
      <form action={deleteBucketListItem.bind(null, item.id)}>
        <button type="submit" aria-label="Delete item" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function BucketList({ items }: { items: BucketListItem[] }) {
  if (!items.length) {
    return <p className="text-center text-sm text-charcoal-soft">Nothing on the bucket list yet.</p>;
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
