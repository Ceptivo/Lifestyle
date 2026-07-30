"use client";

import { useMemo, useState } from "react";
import { ChartColumn, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { mondayOf, addDays, DAY_LABELS } from "@/lib/health";

type Activity = {
  activityType: string;
  performedOn: string;
  durationMinutes: number | null;
  distanceKm: number | null;
};

type Period = "week" | "month" | "all";
type HeatmapScope = "month" | "all";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All time" },
];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function intensity(count: number): string {
  if (count <= 0) return "rgba(255, 255, 255, 0.06)";
  if (count === 1) return "rgba(199, 245, 59, 0.35)";
  if (count === 2) return "rgba(199, 245, 59, 0.62)";
  return "rgba(199, 245, 59, 0.9)";
}

function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return hours >= 1 ? `${hours.toFixed(1)}h` : `${Math.round(minutes)}min`;
}

function Pills<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            value === o.value ? "bg-pink text-ink" : "bg-cream text-charcoal-soft hover:text-charcoal"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MonthHeatmap({ monthStart, countsByDate }: { monthStart: string; countsByDate: Map<string, number> }) {
  const [y, m] = monthStart.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDow = (new Date(monthStart + "T00:00:00").getDay() + 6) % 7;

  const cells: { date: string; day: number }[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: `${monthStart.slice(0, 8)}${String(day).padStart(2, "0")}`, day });
  }

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((d) => (
          <p key={d} className="text-center text-[10px] font-medium text-charcoal-soft">
            {d.slice(0, 1)}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {cells.map((c) => (
          <div
            key={c.date}
            title={`${c.date}: ${countsByDate.get(c.date) ?? 0} session(s)`}
            className="flex aspect-square items-center justify-center rounded-md text-[10px] font-medium text-charcoal-soft"
            style={{ backgroundColor: intensity(countsByDate.get(c.date) ?? 0) }}
          >
            {c.day}
          </div>
        ))}
      </div>
    </div>
  );
}

function AllTimeHeatmap({ earliestDate, today, countsByDate }: { earliestDate: string | null; today: string; countsByDate: Map<string, number> }) {
  if (!earliestDate) {
    return <p className="text-center text-sm text-charcoal-soft">No activity history yet.</p>;
  }

  const startMonday = mondayOf(earliestDate);
  const endMonday = mondayOf(today);
  const weeks: string[][] = [];
  let cursor = startMonday;
  while (cursor <= endMonday) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
    cursor = addDays(cursor, 7);
  }

  return (
    <div className="overflow-x-auto pb-1 scrollbar-hide">
      <div className="flex gap-1">
        {weeks.map((week, wi) => {
          const monthLabel = week.find((d) => d.endsWith("-01"));
          return (
            <div key={wi} className="flex flex-col items-center gap-1">
              <p className="h-3 text-[9px] font-medium text-charcoal-soft">
                {monthLabel ? MONTH_SHORT[Number(monthLabel.slice(5, 7)) - 1] : ""}
              </p>
              <div className="flex flex-col gap-1">
                {week.map((date) => (
                  <div
                    key={date}
                    title={`${date}: ${countsByDate.get(date) ?? 0} session(s)`}
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: date > today ? "transparent" : intensity(countsByDate.get(date) ?? 0) }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrainingSummaryPanel({
  activities,
  today,
  weekStart,
  monthStart,
}: {
  activities: Activity[];
  today: string;
  weekStart: string;
  monthStart: string;
}) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("week");
  const [heatmapScope, setHeatmapScope] = useState<HeatmapScope>("month");

  const filtered = useMemo(() => {
    if (period === "week") return activities.filter((a) => a.performedOn >= weekStart);
    if (period === "month") return activities.filter((a) => a.performedOn >= monthStart);
    return activities;
  }, [activities, period, weekStart, monthStart]);

  const summary = useMemo(() => {
    const map = new Map<string, { sessions: number; distanceKm: number; durationMinutes: number }>();
    for (const a of filtered) {
      const row = map.get(a.activityType) ?? { sessions: 0, distanceKm: 0, durationMinutes: 0 };
      row.sessions += 1;
      row.distanceKm += a.distanceKm ?? 0;
      row.durationMinutes += a.durationMinutes ?? 0;
      map.set(a.activityType, row);
    }
    return Array.from(map.entries())
      .map(([activityType, v]) => ({ activityType, ...v }))
      .sort((a, b) => b.durationMinutes - a.durationMinutes);
  }, [filtered]);

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of activities) {
      map.set(a.performedOn, (map.get(a.performedOn) ?? 0) + 1);
    }
    return map;
  }, [activities]);

  const earliestDate = useMemo(
    () => (activities.length ? activities.reduce((min, a) => (a.performedOn < min ? a.performedOn : min), activities[0].performedOn) : null),
    [activities]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open training summary"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <ChartColumn size={20} />
      </button>

      <div
        className={cn("fixed inset-0 z-50 bg-black/50 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-paper p-5 shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Training summary"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-lg font-bold text-charcoal">Training summary</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Totals by exercise</h3>
        </div>
        <div className="mb-3">
          <Pills options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </div>
        <div className="mb-6 space-y-1.5">
          {summary.length === 0 ? (
            <p className="text-sm text-charcoal-soft">No activities in this period.</p>
          ) : (
            summary.map((s) => (
              <div key={s.activityType} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-charcoal">{s.activityType}</p>
                  <p className="text-xs text-charcoal-soft">
                    {s.sessions} {s.sessions === 1 ? "session" : "sessions"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {s.distanceKm > 0 && <p className="text-sm font-semibold tabular-nums text-charcoal">{s.distanceKm.toFixed(1)}km</p>}
                  <p className="text-xs tabular-nums text-charcoal-soft">{formatHours(s.durationMinutes)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Sessions</h3>
          <Pills
            options={[
              { value: "month" as HeatmapScope, label: "Month" },
              { value: "all" as HeatmapScope, label: "All time" },
            ]}
            value={heatmapScope}
            onChange={setHeatmapScope}
          />
        </div>
        {heatmapScope === "month" ? (
          <MonthHeatmap monthStart={monthStart} countsByDate={countsByDate} />
        ) : (
          <AllTimeHeatmap earliestDate={earliestDate} today={today} countsByDate={countsByDate} />
        )}
      </div>
    </>
  );
}
