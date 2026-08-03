import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { LectureDayList, type DayLecture } from "@/components/university/LectureDayList";
import { cn } from "@/lib/cn";
import { addDays, formatShortDate, formatWeekDay, formatWeekRange } from "@/lib/university-calendar";

export type { DayLecture };
export type DayAssignment = { id: string; title: string; moduleCode: string | null; flagged: boolean };
export type DayBanner = { label: string; icon: string };

export type CalendarDay = {
  date: string;
  lectures: DayLecture[];
  assignments: DayAssignment[];
  banners: DayBanner[];
};

export function LectureWeekView({
  monday,
  saturday,
  days,
  todayIso,
  currentWeekMonday,
}: {
  monday: string;
  saturday: string;
  days: CalendarDay[];
  todayIso: string;
  currentWeekMonday: string;
}) {
  const prevWeek = addDays(monday, -7);
  const nextWeek = addDays(monday, 7);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/university/calendar?date=${prevWeek}`}
          aria-label="Previous week"
          className="rounded-full p-2 text-charcoal-soft hover:bg-cream hover:text-charcoal"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="text-center">
          <p className="text-sm font-semibold text-charcoal">{formatWeekRange(monday, saturday)}</p>
          {monday !== currentWeekMonday && (
            <Link href={`/university/calendar?date=${todayIso}`} className="text-xs font-medium text-pink-dark">
              Back to this week
            </Link>
          )}
        </div>
        <Link
          href={`/university/calendar?date=${nextWeek}`}
          aria-label="Next week"
          className="rounded-full p-2 text-charcoal-soft hover:bg-cream hover:text-charcoal"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <Card className="divide-y divide-border">
        {days.map((day) => (
          <div key={day.date} className="py-3 first:pt-0 last:pb-0">
            <div className="mb-2 flex items-baseline gap-2">
              <p className={cn("text-xs font-semibold uppercase tracking-wide", day.date === todayIso ? "text-pink-dark" : "text-charcoal-soft")}>
                {formatWeekDay(day.date)}
              </p>
              <p className="text-xs text-charcoal-soft">{formatShortDate(day.date)}</p>
            </div>

            {day.banners.map((b, i) => (
              <div key={i} className="mb-2 flex items-center gap-2 rounded-2xl bg-pink-soft px-3 py-2 text-xs font-medium text-pink-dark">
                <Icon name={b.icon} size={13} />
                {b.label}
              </div>
            ))}

            {day.assignments.map((a) => (
              <Link
                key={a.id}
                href="/university/assignments"
                className={cn(
                  "mb-2 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium",
                  a.flagged ? "bg-danger-soft text-danger" : "bg-cream text-charcoal"
                )}
              >
                <Icon name="flag" size={13} className="shrink-0" />
                <span className="min-w-0 flex-1 break-words">
                  {a.title}
                  {a.moduleCode && <span className="font-normal opacity-75"> · {a.moduleCode}</span>} due today
                </span>
              </Link>
            ))}

            {day.lectures.length === 0 && day.assignments.length === 0 && day.banners.length === 0 && (
              <p className="text-sm text-charcoal-soft">No lectures</p>
            )}

            {day.lectures.length > 0 && <LectureDayList lectures={day.lectures} attendance />}
          </div>
        ))}
      </Card>
    </div>
  );
}
