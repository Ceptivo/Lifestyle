"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { updateHealthGoalStatus, deleteHealthGoal } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { GoalStatus } from "@/lib/types";

const STATUS_FLOW: Record<GoalStatus, GoalStatus> = {
  planned: "in_progress",
  in_progress: "done",
  done: "planned",
};

const STATUS_LABEL: Record<GoalStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_CLASS: Record<GoalStatus, string> = {
  planned: "bg-cream text-charcoal-soft",
  in_progress: "bg-pink-soft text-pink-dark",
  done: "bg-emerald-500/15 text-emerald-600",
};

export type HealthGoal = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  status: GoalStatus;
  targetDateFormatted: string | null;
};

function GoalRow({ goal }: { goal: HealthGoal }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={goal.icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{goal.name}</p>
        {goal.targetDateFormatted && <p className="text-xs text-charcoal-soft">{goal.targetDateFormatted}</p>}
        {goal.description && <p className="mt-0.5 text-xs text-charcoal-soft">{goal.description}</p>}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => updateHealthGoalStatus(goal.id, STATUS_FLOW[goal.status]))}
        className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", STATUS_CLASS[goal.status])}
      >
        {STATUS_LABEL[goal.status]}
      </button>
      <form action={deleteHealthGoal.bind(null, goal.id)}>
        <button type="submit" aria-label="Delete goal" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function HealthGoalList({ goals }: { goals: HealthGoal[] }) {
  if (!goals.length) {
    return <p className="text-center text-sm text-charcoal-soft">No health goals yet. Add your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {goals.map((g) => (
        <li key={g.id}>
          <GoalRow goal={g} />
        </li>
      ))}
    </ul>
  );
}
