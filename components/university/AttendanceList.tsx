"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { toggleLectureAttendance } from "@/app/actions/university-calendar";
import { cn } from "@/lib/cn";
import { formatTimeRange } from "@/lib/university-calendar";

export type AttendanceLecture = {
  id: string;
  dateFormatted: string;
  moduleCode: string;
  moduleName: string;
  moduleIcon: string;
  startTime: string;
  endTime: string;
  attended: boolean;
};

export type AttendanceMonthGroup = { month: string; lectures: AttendanceLecture[] };

function AttendanceRow({ lecture }: { lecture: AttendanceLecture }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleLectureAttendance(lecture.id, !lecture.attended))}
        aria-label={lecture.attended ? "Mark not attended" : "Mark attended"}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          lecture.attended ? "border-pink bg-pink text-ink" : "border-border text-transparent hover:border-pink-dark"
        )}
      >
        <Check size={14} strokeWidth={3} />
      </button>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={lecture.moduleIcon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-charcoal">
          {lecture.moduleName}
          <span className="font-normal text-charcoal-soft"> · {lecture.moduleCode}</span>
        </p>
        <p className="text-xs text-charcoal-soft">
          {lecture.dateFormatted} · {formatTimeRange(lecture.startTime, lecture.endTime)}
        </p>
      </div>
    </div>
  );
}

export function AttendanceList({ groups }: { groups: AttendanceMonthGroup[] }) {
  if (!groups.length) {
    return <p className="text-center text-sm text-charcoal-soft">No lectures held yet.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.month}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">{g.month}</h3>
          <Card className="divide-y divide-border">
            {g.lectures.map((l) => (
              <AttendanceRow key={l.id} lecture={l} />
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
