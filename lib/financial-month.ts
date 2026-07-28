import { todayLocalDate } from "@/lib/format";

// The user's financial month doesn't follow the calendar: it starts on this
// day of the previous calendar month and runs through the day before this
// day in the named month — e.g. financial "August" is Jul 24 – Aug 23, so a
// transaction dated Jul 24 already belongs to financial August, and one
// dated Aug 24 belongs to financial September.
const START_DAY = 24;

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// The "YYYY-MM" financial-month key a calendar date falls into. The key is
// named after the financial month's *ending* calendar month, so labels
// generated from it read exactly like a normal calendar month.
export function financialMonthKey(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00");
  const monthIndex = d.getDate() >= START_DAY ? d.getMonth() + 1 : d.getMonth();
  const target = new Date(d.getFullYear(), monthIndex, 1);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
}

export function currentFinancialMonthKey(): string {
  return financialMonthKey(todayLocalDate());
}

export function shiftFinancialMonthKey(key: string, offset: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Inclusive [start, end] calendar-date range for a financial-month key.
export function financialMonthRange(key: string): { start: string; end: string } {
  const [y, m] = key.split("-").map(Number);
  const start = new Date(y, m - 2, START_DAY);
  const end = new Date(y, m - 1, START_DAY - 1);
  return { start: toISO(start), end: toISO(end) };
}

// Exclusive upper bound (start of the next financial month) — for call
// sites that compare with `<` instead of `<=`.
export function financialMonthEndExclusive(key: string): string {
  return financialMonthRange(shiftFinancialMonthKey(key, 1)).start;
}

export function financialMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
