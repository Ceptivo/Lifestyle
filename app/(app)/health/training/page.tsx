import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TrainingWeekPlan } from "@/components/health/TrainingWeekPlan";
import { ActivityForm } from "@/components/health/ActivityForm";
import { ActivityLogList } from "@/components/health/ActivityLogList";
import { BackLink } from "@/components/ui/BackLink";
import { todayLocalDate, formatDate } from "@/lib/format";
import { mondayOf, addDays, formatWeekRangeLabel } from "@/lib/health";

export const revalidate = 60;

export default async function TrainingPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const today = todayLocalDate();
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? mondayOf(week) : mondayOf(today);
  const prevWeek = addDays(weekStart, -7);
  const nextWeek = addDays(weekStart, 7);

  const supabase = createClient();
  const [{ data: weekRow }, { data: activities }] = await Promise.all([
    supabase.from("health_training_weeks").select("id").eq("week_start_date", weekStart).maybeSingle(),
    supabase
      .from("health_activities")
      .select("id, title, activity_type, performed_on, duration_minutes, distance_km, calories, source, icon")
      .order("performed_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  let plans: Record<number, { dayOfWeek: number; title: string; description: string | null; icon: string } | null> = {};
  if (weekRow) {
    const { data: items } = await supabase
      .from("health_training_plan_items")
      .select("day_of_week, title, description, icon")
      .eq("week_id", weekRow.id);
    plans = Object.fromEntries(
      (items ?? []).map((i) => [i.day_of_week, { dayOfWeek: i.day_of_week, title: i.title, description: i.description, icon: i.icon }])
    );
  }

  const activityRows = (activities ?? []).map((a) => {
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
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Training</h1>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Weekly plan</h2>
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/health/training?week=${prevWeek}`}
          aria-label="Previous week"
          className="rounded-full p-2 text-charcoal-soft hover:bg-cream hover:text-charcoal"
        >
          <ChevronLeft size={18} />
        </Link>
        <p className="text-sm font-medium text-charcoal">{formatWeekRangeLabel(weekStart)}</p>
        <Link
          href={`/health/training?week=${nextWeek}`}
          aria-label="Next week"
          className="rounded-full p-2 text-charcoal-soft hover:bg-cream hover:text-charcoal"
        >
          <ChevronRight size={18} />
        </Link>
      </div>
      <div className="mb-6">
        <TrainingWeekPlan weekStartDate={weekStart} plans={plans} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Activity log</h2>
      <div className="mb-4">
        <ActivityForm />
      </div>
      <ActivityLogList activities={activityRows} />
    </div>
  );
}
