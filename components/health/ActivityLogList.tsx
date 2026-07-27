import { Trash2 } from "lucide-react";
import { deleteActivity } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type Activity = {
  id: string;
  title: string;
  activityType: string;
  icon: string;
  source: string;
  performedOnFormatted: string;
  metaLine: string;
};

export function ActivityLogList({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return <p className="text-center text-sm text-charcoal-soft">No activities logged yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <li key={a.id}>
          <Card className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={a.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal">{a.title}</p>
              <p className="text-xs text-charcoal-soft">
                {a.performedOnFormatted} · {a.metaLine}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal-soft">
              {a.source === "manual" ? "Manual" : "Samsung Health"}
            </span>
            <form action={deleteActivity.bind(null, a.id)}>
              <button
                type="submit"
                aria-label="Delete activity"
                className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
