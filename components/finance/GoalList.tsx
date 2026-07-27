"use client";

import { useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addGoalProgress, deleteGoal } from "@/app/actions/finance-goals";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

type Goal = {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  currentAmountFormatted: string;
  targetAmountFormatted: string;
  targetDateFormatted: string | null;
};

function GoalCard({ goal }: { goal: Goal }) {
  const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const achieved = goal.currentAmount >= goal.targetAmount;
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="px-4 py-3.5">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={goal.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-charcoal">{goal.name}</p>
          <p className="text-xs text-charcoal-soft">
            {goal.currentAmountFormatted} of {goal.targetAmountFormatted}
            {goal.targetDateFormatted && ` · by ${goal.targetDateFormatted}`}
          </p>
        </div>
        <form action={deleteGoal.bind(null, goal.id)}>
          <button
            type="submit"
            aria-label="Delete goal"
            className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-pink"
          >
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-cream">
        <div
          className={achieved ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-pink"}
          style={{ width: `${pct}%` }}
        />
      </div>

      {!achieved && (
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await addGoalProgress(goal.id, formData);
              formRef.current?.reset();
            });
          }}
          className="flex gap-2"
        >
          <Input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="Add funds" />
          <Button type="submit" variant="secondary" disabled={isPending}>
            Add
          </Button>
        </form>
      )}
    </Card>
  );
}

export function GoalList({ goals }: { goals: Goal[] }) {
  if (!goals.length) {
    return <p className="text-center text-sm text-charcoal-soft">No goals yet. Set one to start saving.</p>;
  }

  return (
    <ul className="space-y-2">
      {goals.map((goal) => (
        <li key={goal.id}>
          <GoalCard goal={goal} />
        </li>
      ))}
    </ul>
  );
}
