import { createClient } from "@/lib/supabase/server";
import { TrainingWeekPlan, type PlanItem } from "@/components/health/TrainingWeekPlan";
import { WeekTrainingSummary } from "@/components/health/WeekTrainingSummary";
import { TrainingSummaryPanel } from "@/components/health/TrainingSummaryPanel";
import { ActivityForm } from "@/components/health/ActivityForm";
import { ActivityLogList } from "@/components/health/ActivityLogList";
import { BackLink } from "@/components/ui/BackLink";
import { todayLocalDate, formatDate } from "@/lib/format";
import { mondayOf, addDays } from "@/lib/health";

export const revalidate = 60;

export default async function TrainingPage() {
  const today = todayLocalDate();
  const weekStart = mondayOf(today);
  const weekEnd = addDays(weekStart, 6);
  const monthStart = `${today.slice(0, 7)}-01`;

  const supabase = createClient();
  const [{ data: planRows }, { data: activities }] = await Promise.all([
    supabase.from("health_training_plan").select("id, day_of_week, title, description, icon"),
    supabase
      .from("health_activities")
      .select("id, title, activity_type, performed_on, duration_minutes, distance_km, calories, source, icon")
      .order("performed_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  const planItems: PlanItem[] = (planRows ?? []).map((p) => ({
    id: p.id,
    dayOfWeek: p.day_of_week,
    title: p.title,
    description: p.description,
    icon: p.icon,
  }));

  const allActivities = activities ?? [];
  const weekActivities = allActivities.filter((a) => a.performed_on >= weekStart && a.performed_on <= weekEnd);
  const sessionCount = weekActivities.length;
  const trainedDays = new Set(weekActivities.map((a) => (new Date(a.performed_on + "T00:00:00").getDay() + 6) % 7));

  const panelActivities = allActivities.map((a) => ({
    activityType: a.activity_type,
    performedOn: a.performed_on,
    durationMinutes: a.duration_minutes,
    distanceKm: a.distance_km,
  }));

  const activityRows = allActivities.slice(0, 30).map((a) => {
    const metaParts = [a.activity_type];
    if (a.duration_minutes) metaParts.push(`${a.duration_minutes}min`);
    if (a.distance_km) metaParts.push(`${a.distance_km}km`);
    if (a.calories) metaParts.push(`${a.calories}cal`);
    return {
      id: a.id,
      title: a.title,
      activityType: a.activity_type,
      icon: a.icon,
      source: a.source,
      performedOnFormatted: formatDate(a.performed_on),
      metaLine: metaParts.join(" · "),
    };
  });

  return (
    <div>
      <BackLink href="/health" label="Back to Health" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Training</h1>
        <TrainingSummaryPanel activities={panelActivities} today={today} weekStart={weekStart} monthStart={monthStart} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Weekly plan</h2>
      <div className="mb-6">
        <TrainingWeekPlan items={planItems} />
      </div>

      <div className="mb-6">
        <WeekTrainingSummary sessionCount={sessionCount} trainedDays={trainedDays} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Activity log</h2>
      <div className="mb-4">
        <ActivityForm />
      </div>
      <ActivityLogList activities={activityRows} />
    </div>
  );
}
