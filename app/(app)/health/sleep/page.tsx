import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { SleepLogForm } from "@/components/health/SleepLogForm";
import { SleepLogList } from "@/components/health/SleepLogList";
import { SleepCorrelationChart } from "@/components/charts/SleepCorrelationChart";
import { BackLink } from "@/components/ui/BackLink";
import { bucketSleepData, generateSleepInsight } from "@/lib/health-insights";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function SleepPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from("health_sleep_logs")
    .select("*")
    .order("sleep_date", { ascending: false })
    .limit(60);

  const entries = (logs ?? []).map((l) => ({
    durationHours: l.duration_hours,
    moodNextDay: l.mood_next_day,
    energyNextDay: l.energy_next_day,
  }));
  const buckets = bucketSleepData(entries);
  const insight = generateSleepInsight(entries);

  const logRows = (logs ?? []).map((l) => {
    const ratingParts: string[] = [];
    if (l.quality_rating != null) ratingParts.push(`Quality ${l.quality_rating}/5`);
    if (l.mood_next_day != null) ratingParts.push(`Mood ${l.mood_next_day}/5`);
    if (l.energy_next_day != null) ratingParts.push(`Energy ${l.energy_next_day}/5`);
    return {
      id: l.id,
      sleepDateFormatted: formatDate(l.sleep_date),
      durationLabel: l.duration_hours != null ? `${l.duration_hours}h` : "—",
      ratingsLine: ratingParts.length ? ratingParts.join(" · ") : "No ratings logged",
      notes: l.notes,
    };
  });

  return (
    <div>
      <BackLink href="/health" label="Back to Health" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Sleep</h1>

      <div className="mb-6">
        <SleepLogForm />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Sleep vs. next-day mood &amp; energy
      </h2>
      <Card className="mb-3">
        <SleepCorrelationChart buckets={buckets} />
      </Card>
      <div className="mb-6">
        {insight && <p className="rounded-2xl bg-pink-soft px-4 py-3 text-sm text-pink-dark">{insight}</p>}
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Sleep log</h2>
      <SleepLogList logs={logRows} />
    </div>
  );
}
