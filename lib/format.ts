export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(amount);
}

// Rounds to whole Rand — for tight spaces (stat cards, ring labels) where the
// cents aren't worth the extra width.
export function formatCurrencyCompact(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// "24th July" — a day-grouping heading, not a full timestamp. Only appends
// the year when it isn't the current one, since these headings sit above a
// list of same-day items where the year is otherwise redundant.
export function formatDateHeading(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const yearSuffix = d.getFullYear() !== new Date().getFullYear() ? `, ${d.getFullYear()}` : "";
  return `${day}${ordinalSuffix(day)} ${month}${yearSuffix}`;
}

// Date + time, e.g. "29 Jul 2026, 14:32" — for timestamped log entries
// where both the day and the moment matter.
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSec) >= secondsInUnit) {
      const value = Math.round(diffSec / secondsInUnit);
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(value, unit);
    }
  }
  return "just now";
}

// Local (not UTC) calendar date, so "this month" matches the user's own day.
export function todayLocalDate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

// This app's server runs in UTC (Vercel's default), but its one user is in
// South Africa — SAST, UTC+2, no DST — so it can't be read off the runtime's
// own offset the way todayLocalDate() reads the browser's. Hardcoded since
// there's no per-request signal of the user's zone on a server component.
const SAST_OFFSET_MINUTES = 120;

// Local (SAST) date + time as "YYYY-MM-DDTHH:mm:ss", for comparing against
// the plain "timestamp" (no time zone) columns this app stores wall-clock
// values in (e.g. reminders' display window, typed via a datetime-local
// input that carries no time zone of its own).
export function nowLocalDateTime(): string {
  return new Date(Date.now() + SAST_OFFSET_MINUTES * 60 * 1000).toISOString().slice(0, 19);
}

const WEEKDAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export function todayWeekday(): (typeof WEEKDAY_NAMES)[number] {
  const dayIndex = new Date(todayLocalDate() + "T00:00:00").getDay();
  return WEEKDAY_NAMES[dayIndex];
}
