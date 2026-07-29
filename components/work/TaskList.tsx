"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleTask, deleteTask } from "@/app/actions/work";
import { Card } from "@/components/ui/Card";
import type { TaskPriority } from "@/lib/types";
import { cn } from "@/lib/cn";

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  low: "bg-cream text-charcoal-soft",
  medium: "bg-pink-soft text-pink-dark",
  high: "bg-danger-soft text-danger",
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  done: boolean;
  priority: TaskPriority;
  dueDateFormatted: string | null;
  overdue: boolean;
};

function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleTask(task.id, task.done))}
        aria-label={task.done ? "Mark not done" : "Mark done"}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          task.done ? "border-pink bg-pink text-ink" : "border-border text-transparent"
        )}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("break-words hyphens-auto text-sm font-medium", task.done ? "text-charcoal-soft line-through" : "text-charcoal")}>
          {task.title}
        </p>
        {task.notes && <p className="text-xs text-charcoal-soft">{task.notes}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", PRIORITY_CLASS[task.priority])}>
            {task.priority}
          </span>
          {task.dueDateFormatted && (
            <span className={cn("text-[10px] font-semibold", task.overdue && !task.done ? "text-danger" : "text-charcoal-soft")}>
              {task.overdue && !task.done ? "Overdue · " : "Due "}
              {task.dueDateFormatted}
            </span>
          )}
        </div>
      </div>
      <form action={deleteTask.bind(null, task.id)}>
        <button type="submit" aria-label="Delete task" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) {
    return <p className="text-center text-sm text-charcoal-soft">No tasks yet. Add your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li key={t.id}>
          <TaskRow task={t} />
        </li>
      ))}
    </ul>
  );
}
