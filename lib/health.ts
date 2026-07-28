export const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Monday (day_of_week 0) of the week containing the given local ISO date.
export function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const jsDay = d.getDay(); // 0 = Sunday
  const offset = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + offset);
  return isoDate(d);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function formatWeekRangeLabel(mondayStr: string): string {
  const start = new Date(mondayStr + "T00:00:00");
  const end = new Date(addDays(mondayStr, 6) + "T00:00:00");
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

// Hours between a bedtime and wake time ("HH:MM" 24h strings), assuming the
// wake time is on the next day whenever it isn't later than bedtime (covers
// the normal overnight case; same-day naps would need bedtime < wakeTime).
export function computeSleepDurationHours(bedtime: string, wakeTime: string): number | null {
  if (!bedtime || !wakeTime) return null;
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  if ([bh, bm, wh, wm].some((n) => Number.isNaN(n))) return null;

  const startMinutes = bh * 60 + bm;
  let endMinutes = wh * 60 + wm;
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;

  return Math.round(((endMinutes - startMinutes) / 60) * 10) / 10;
}
