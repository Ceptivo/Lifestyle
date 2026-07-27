function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

// Next date >= today sharing the occasion's month/day (this year, or next
// year if this year's date has already passed). Non-recurring occasions
// just return their stored date as-is.
export function nextOccurrence(occasionDateISO: string, todayISO: string, recurring: boolean): string {
  if (!recurring) return occasionDateISO;

  const today = new Date(todayISO + "T00:00:00");
  const occasion = new Date(occasionDateISO + "T00:00:00");
  const thisYear = new Date(today.getFullYear(), occasion.getMonth(), occasion.getDate());

  if (isoDate(thisYear) >= todayISO) return isoDate(thisYear);
  return isoDate(new Date(today.getFullYear() + 1, occasion.getMonth(), occasion.getDate()));
}
