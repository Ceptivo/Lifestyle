// Date math for the lecture-calendar week view. All dates are plain ISO
// strings (YYYY-MM-DD) parsed as local midnight, matching the convention
// used elsewhere in lib/format.ts.

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Monday of the week containing `iso` — the timetable's week always starts
// Monday, so every week-view anchor is normalized to this.
export function mondayOf(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const dayIndex = d.getDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
  return addDays(iso, diffToMonday);
}

export function formatWeekDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function formatWeekRange(mondayIso: string, saturdayIso: string): string {
  const start = new Date(mondayIso + "T00:00:00");
  const end = new Date(saturdayIso + "T00:00:00");
  const startStr = start.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  const endStr =
    start.getMonth() === end.getMonth()
      ? end.toLocaleDateString("en-US", { day: "numeric" })
      : end.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return `${startStr} – ${endStr}`;
}

export function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => t.slice(0, 5);
  return `${fmt(start)} – ${fmt(end)}`;
}
