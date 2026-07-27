import type { SubscriptionCycle } from "@/lib/types";

export const CYCLE_LABEL: Record<SubscriptionCycle, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

// Weekly normalized via 52 weeks/year ÷ 12 months; yearly ÷ 12.
export function monthlyEquivalent(amount: number, cycle: SubscriptionCycle): number {
  switch (cycle) {
    case "weekly":
      return (amount * 52) / 12;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

export function advanceDueDate(dateStr: string, cycle: SubscriptionCycle): string {
  const d = new Date(dateStr + "T00:00:00");
  if (cycle === "weekly") {
    d.setDate(d.getDate() + 7);
  } else if (cycle === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().slice(0, 10);
}

// Simulates a subscription's future due dates forward from its current
// next_due_date, returning the ones that fall within [rangeStart, rangeEnd).
// Used by Forecast to know how many times a weekly/monthly/yearly bill will
// land inside a given projection window.
export function projectOccurrencesInRange(
  nextDueDate: string,
  cycle: SubscriptionCycle,
  rangeStart: string,
  rangeEnd: string
): string[] {
  const occurrences: string[] = [];
  let current = nextDueDate;
  let iterations = 0;
  while (current < rangeEnd && iterations < 500) {
    if (current >= rangeStart) occurrences.push(current);
    current = advanceDueDate(current, cycle);
    iterations++;
  }
  return occurrences;
}
