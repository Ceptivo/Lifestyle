"use client";

import { useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { toggleHabitLog, deleteHabit } from "@/app/actions/habits";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type HabitDay = { date: string; label: string; done: boolean };
export type Habit = { id: string; name: string; icon: string; streak: number; todayDate: string; todayDone: boolean; last7: HabitDay[] };

function HabitRow({ habit }: { habit: Habit }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={habit.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{habit.name}</p>
          <p className="text-xs text-charcoal-soft">{habit.streak > 0 ? `${habit.streak} day${habit.streak === 1 ? "" : "s"} streak` : "No streak yet"}</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => toggleHabitLog(habit.id, habit.todayDate, !habit.todayDone))}
          aria-label={habit.todayDone ? "Mark today not done" : "Mark today done"}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
            habit.todayDone ? "bg-pink text-ink" : "bg-cream text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
          )}
        >
          <Check size={16} />
        </button>
        <form action={deleteHabit.bind(null, habit.id)}>
          <button type="submit" aria-label="Delete habit" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
            <Trash2 size={14} />
          </button>
        </form>
      </div>
      <div className="mt-3 flex justify-between gap-1">
        {habit.last7.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-charcoal-soft">{d.label}</span>
            <span className={cn("h-2.5 w-2.5 rounded-full", d.done ? "bg-pink" : "bg-cream")} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function HabitList({ habits }: { habits: Habit[] }) {
  if (!habits.length) {
    return <p className="text-center text-sm text-charcoal-soft">No habits yet. Add your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {habits.map((h) => (
        <li key={h.id}>
          <HabitRow habit={h} />
        </li>
      ))}
    </ul>
  );
}
