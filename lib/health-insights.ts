// Correlation read for the Sleep page: does more sleep track with better
// next-day mood/energy in this person's own log? Grounded in the entries
// themselves, not an external norm — and it says nothing until there's
// enough data to say it responsibly (mirrors the thin-history guard used
// in lib/insights.ts for Finance).

const MIN_ENTRIES_PER_GROUP = 3;
const BUCKET_DEFS = [
  { label: "<6h", min: 0, max: 6 },
  { label: "6-7h", min: 6, max: 7 },
  { label: "7-8h", min: 7, max: 8 },
  { label: "8h+", min: 8, max: Infinity },
];

export type SleepEntry = { durationHours: number | null; moodNextDay: number | null; energyNextDay: number | null };
export type SleepBucket = { label: string; avgMood: number | null; avgEnergy: number | null; count: number };

function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
}

export function bucketSleepData(entries: SleepEntry[]): SleepBucket[] {
  return BUCKET_DEFS.map(({ label, min, max }) => {
    const inBucket = entries.filter((e) => e.durationHours != null && e.durationHours >= min && e.durationHours < max);
    return {
      label,
      avgMood: average(inBucket.map((e) => e.moodNextDay).filter((v): v is number => v != null)),
      avgEnergy: average(inBucket.map((e) => e.energyNextDay).filter((v): v is number => v != null)),
      count: inBucket.length,
    };
  });
}

export function generateSleepInsight(entries: SleepEntry[]): string | null {
  const shortNights = entries.filter((e) => e.durationHours != null && e.durationHours < 7);
  const longNights = entries.filter((e) => e.durationHours != null && e.durationHours >= 7);

  if (shortNights.length < MIN_ENTRIES_PER_GROUP || longNights.length < MIN_ENTRIES_PER_GROUP) {
    return null;
  }

  const shortMood = average(shortNights.map((e) => e.moodNextDay).filter((v): v is number => v != null));
  const longMood = average(longNights.map((e) => e.moodNextDay).filter((v): v is number => v != null));
  const shortEnergy = average(shortNights.map((e) => e.energyNextDay).filter((v): v is number => v != null));
  const longEnergy = average(longNights.map((e) => e.energyNextDay).filter((v): v is number => v != null));

  if (shortMood == null || longMood == null) return null;

  const moodDiff = longMood - shortMood;
  const energyDiff = shortEnergy != null && longEnergy != null ? longEnergy - shortEnergy : null;

  if (moodDiff >= 0.4) {
    return `In your log, nights with 7+ hours of sleep track with noticeably better next-day mood (avg ${longMood.toFixed(1)}/5 vs ${shortMood.toFixed(1)}/5 on shorter nights)${
      energyDiff != null && energyDiff > 0 ? " — energy follows the same pattern." : "."
    }`;
  }
  if (moodDiff <= -0.4) {
    return `Interestingly, your shorter nights (under 7h) show slightly better logged mood than longer ones (${shortMood.toFixed(1)}/5 vs ${longMood.toFixed(1)}/5) — worth noting other factors (stress, timing) may matter more than duration alone for you.`;
  }
  return `No strong link yet between sleep duration and next-day mood in your log (${longMood.toFixed(1)}/5 on 7h+ nights vs ${shortMood.toFixed(1)}/5 on shorter ones) — keep logging and a clearer pattern may emerge.`;
}
