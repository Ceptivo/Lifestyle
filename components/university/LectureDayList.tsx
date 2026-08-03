import { Icon } from "@/components/ui/Icon";
import { formatTimeRange } from "@/lib/university-calendar";

export type DayLecture = {
  id: string;
  moduleCode: string;
  moduleName: string;
  moduleIcon: string;
  startTime: string;
  endTime: string;
  room: string | null;
};

export function LectureDayList({ lectures }: { lectures: DayLecture[] }) {
  if (!lectures.length) return <p className="text-sm text-charcoal-soft">No lectures today</p>;

  return (
    <div className="space-y-1.5">
      {lectures.map((l) => (
        <div key={l.id} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
            <Icon name={l.moduleIcon} size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-charcoal">{l.moduleName}</p>
            <p className="text-xs text-charcoal-soft">
              {formatTimeRange(l.startTime, l.endTime)}
              {l.room && ` · ${l.room}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
