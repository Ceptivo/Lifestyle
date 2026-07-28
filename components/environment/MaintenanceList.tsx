import { Trash2, Check } from "lucide-react";
import { markMaintenanceDone, deleteMaintenanceTask } from "@/app/actions/environment";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type MaintenanceTask = {
  id: string;
  title: string;
  notes: string | null;
  icon: string;
  intervalDays: number | null;
  dueDateFormatted: string;
  overdue: boolean;
};

export function MaintenanceList({ tasks }: { tasks: MaintenanceTask[] }) {
  if (!tasks.length) {
    return <p className="text-center text-sm text-charcoal-soft">No maintenance tasks yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li key={t.id}>
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", t.overdue ? "bg-danger-soft text-danger" : "bg-pink-soft text-pink-dark")}>
              <Icon name={t.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal">{t.title}</p>
              <p className={cn("text-xs", t.overdue ? "font-semibold text-danger" : "text-charcoal-soft")}>
                {t.overdue ? "Overdue · " : "Due "}
                {t.dueDateFormatted}
                {t.intervalDays && ` · every ${t.intervalDays}d`}
              </p>
              {t.notes && <p className="mt-0.5 text-xs text-charcoal-soft">{t.notes}</p>}
            </div>
            <form action={markMaintenanceDone.bind(null, t.id)}>
              <button type="submit" aria-label="Mark done" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-emerald-600">
                <Check size={16} />
              </button>
            </form>
            <form action={deleteMaintenanceTask.bind(null, t.id)}>
              <button type="submit" aria-label="Delete task" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
