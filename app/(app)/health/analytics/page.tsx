import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { WeeklyTrainingChart } from "@/components/charts/WeeklyTrainingChart";
import { SleepTrendChart } from "@/components/charts/SleepTrendChart";
import { todayLocalDate } from "@/lib/format";
import { mondayOf, addDays } from "@/lib/health";

export const revalidate = 60;

const TRAINING_WEEKS = 8;
const SLEEP_DAYS = 30;
const JOURNAL_DAYS = 90;
const TOP_SYMPTOMS = 6;

export default async function HealthAnalyticsPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const thisWeekStart = mondayOf(today);
  const trainingWindowStart = addDays(thisWeekStart, -(TRAINING_WEEKS - 1) * 7);
  const sleepWindowStart = addDays(today, -(SLEEP_DAYS - 1));
  const journalWindowStart = addDays(today, -(JOURNAL_DAYS - 1));

  const [{ data: activities }, { data: sleepLogs }, { data: journalEntries }] = await Promise.all([
    supabase.from("health_activities").select("performed_on, duration_minutes").gte("performed_on", trainingWindowStart),
    supabase
      .from("health_sleep_logs")
      .select("sleep_date, duration_hours")
      .gte("sleep_date", sleepWindowStart)
      .order("sleep_date", { ascending: true }),
    supabase.from("health_journal_entries").select("entry_date, symptom, severity, body_area").gte("entry_date", journalWindowStart),
  ]);

  // --- Training: minutes trained per week, last 8 weeks --------------------
  const weeks = Array.from({ length: TRAINING_WEEKS }, (_, i) => {
    const start = addDays(thisWeekStart, -(TRAINING_WEEKS - 1 - i) * 7);
    return { start, end: addDays(start, 6) };
  });
  const weekMinutes = weeks.map((w) =>
    (activities ?? [])
      .filter((a) => a.performed_on >= w.start && a.performed_on <= w.end)
      .reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0)
  );
  const totalTrainingHours90d = weekMinutes.reduce((sum, m) => sum + m, 0) / 60;
  const weekPoints = weeks.map((w, i) => {
    const hours = weekMinutes[i] / 60;
    return {
      label: new Date(w.start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours,
      hoursFormatted: `${hours.toFixed(1)}h`,
    };
  });
  const trainingMax = Math.max(1, ...weekPoints.map((w) => w.hours));
  const trainingGridLines = [
    { value: trainingMax, label: `${trainingMax.toFixed(0)}h` },
    { value: trainingMax / 2, label: `${(trainingMax / 2).toFixed(0)}h` },
    { value: 0, label: "0h" },
  ];

  // --- Sleep: duration over the last 30 days --------------------------------
  const sleepPoints = (sleepLogs ?? [])
    .filter((s) => s.duration_hours != null)
    .map((s) => ({
      date: s.sleep_date,
      hours: s.duration_hours as number,
      dateFormatted: new Date(s.sleep_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hoursFormatted: `${s.duration_hours}h`,
    }));
  const avgSleep30d = sleepPoints.length
    ? sleepPoints.reduce((sum, p) => sum + p.hours, 0) / sleepPoints.length
    : null;

  // --- Journal: symptom frequency over the last 90 days ---------------------
  const symptomCounts = new Map<string, number>();
  let severitySum = 0;
  for (const e of journalEntries ?? []) {
    symptomCounts.set(e.symptom, (symptomCounts.get(e.symptom) ?? 0) + 1);
    severitySum += e.severity;
  }
  const avgSeverity90d = (journalEntries ?? []).length ? severitySum / (journalEntries ?? []).length : null;
  const topSymptoms = [...symptomCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_SYMPTOMS);
  const maxSymptomCount = Math.max(1, ...topSymptoms.map(([, count]) => count));

  return (
    <div>
      <BackLink href="/health" label="Back to Health" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Analytics</h1>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Hours trained (90d)" value={`${totalTrainingHours90d.toFixed(1)}h`} />
        <StatCard label="Avg sleep (30d)" value={avgSleep30d != null ? `${avgSleep30d.toFixed(1)}h` : "—"} />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Journal entries (90d)" value={String((journalEntries ?? []).length)} />
        <StatCard label="Avg severity (90d)" value={avgSeverity90d != null ? `${avgSeverity90d.toFixed(1)}/10` : "—"} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Training — hours per week</h2>
      <Card className="mb-6 p-2">
        <WeeklyTrainingChart weeks={weekPoints} gridLines={trainingGridLines} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Sleep — last {SLEEP_DAYS} days</h2>
      <Card className="mb-6">
        <SleepTrendChart points={sleepPoints} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Most logged symptoms — last {JOURNAL_DAYS} days
      </h2>
      <Card className="mb-6 space-y-3">
        {topSymptoms.length === 0 && <p className="text-center text-sm text-charcoal-soft">No journal entries yet.</p>}
        {topSymptoms.map(([symptom, count]) => (
          <div key={symptom}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <p className="text-charcoal">{symptom}</p>
              <p className="font-semibold tabular-nums text-charcoal-soft">{count}×</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-pink" style={{ width: `${(count / maxSymptomCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
