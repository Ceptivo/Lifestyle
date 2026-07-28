"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleChore, deleteChore } from "@/app/actions/environment";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export type Chore = {
  id: string;
  title: string;
  notes: string | null;
  recurring: boolean;
  intervalDays: number | null;
  completed: boolean;
};

function ChoreRow({ chore }: { chore: Chore }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleChore(chore.id))}
        aria-label={chore.completed ? "Mark not done" : "Mark done"}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          chore.completed ? "border-pink bg-pink text-ink" : "border-border text-transparent"
        )}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", chore.completed ? "text-charcoal-soft line-through" : "text-charcoal")}>{chore.title}</p>
        {chore.notes && <p className="text-xs text-charcoal-soft">{chore.notes}</p>}
        {chore.recurring && <p className="text-xs text-charcoal-soft">Repeats every {chore.intervalDays ?? "?"} days</p>}
      </div>
      <form action={deleteChore.bind(null, chore.id)}>
        <button type="submit" aria-label="Delete chore" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function ChoreList({ chores }: { chores: Chore[] }) {
  if (!chores.length) {
    return <p className="text-center text-sm text-charcoal-soft">No chores yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {chores.map((c) => (
        <li key={c.id}>
          <ChoreRow chore={c} />
        </li>
      ))}
    </ul>
  );
}
