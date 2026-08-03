"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatTimeRange } from "@/lib/university-calendar";
import { toggleLectureAttendance } from "@/app/actions/university-calendar";

export type DayLecture = {
  id: string;
  moduleCode: string;
  moduleName: string;
  moduleIcon: string;
  startTime: string;
  endTime: string;
  room: string | null;
  attended?: boolean;
};

function AttendanceCheckbox({ lectureId, attended }: { lectureId: string; attended: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleLectureAttendance(lectureId, !attended))}
      aria-label={attended ? "Mark not attended" : "Mark attended"}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
        attended ? "border-pink bg-pink text-ink" : "border-border text-transparent hover:border-pink-dark"
      )}
    >
      <Check size={14} strokeWidth={3} />
    </button>
  );
}

export function LectureDayList({ lectures, attendance = false }: { lectures: DayLecture[]; attendance?: boolean }) {
  if (!lectures.length) return <p className="text-sm text-charcoal-soft">No lectures today</p>;

  return (
    <div className="space-y-1.5">
      {lectures.map((l) => (
        <div key={l.id} className="flex items-center gap-2.5">
          {attendance && <AttendanceCheckbox lectureId={l.id} attended={l.attended ?? false} />}
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
