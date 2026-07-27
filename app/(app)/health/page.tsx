import Link from "next/link";
import { Dumbbell, Moon, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { todayLocalDate, formatDate } from "@/lib/format";
import { mondayOf, addDays, DAY_LABELS } from "@/lib/health";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { href: "/health/training", label: "Training", icon: Dumbbell },
  { href: "/health/sleep", label: "Sleep", icon: Moon },
  { href: "/health/journal", label: "Journal", icon: BookOpen },
];

export default async function HealthOverviewPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const weekStart = mondayOf(today);
  const weekEnd = addDays(weekStart, 6);
  const sleepWindowStart = addDays(today, -6);
  const todayDayOfWeek = (new Date(today + "T00:00:00").getDay() + 6) % 7;

  const [{ data: weekActivities }, { data: sleepLogs }, { data: nextRace }, { data: currentWeek }, { data: recentActivities }] =
    await Promise.all([
      supabase.from("health_activities").select("duration_minutes").gte("performed_on", weekStart).lte("performed_on", weekEnd),
      supabase.from("health_sleep_logs").select("duration_hours").gte("sleep_date", sleepWindowStart).lte("sleep_date", today),
      supabase
        .from("health_races")
        .select("id, name, event_date, location")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("health_training_weeks").select("id").eq("week_start_date", weekStart).maybeSingle(),
      supabase
        .from("health_activities")
        .select("id, title, activity_type, performed_on, duration_minutes, distance_km, icon")
        .order("performed_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const weekMinutes = (weekActivities ?? []).reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0);
  const sleepDurations = (sleepLogs ?? []).map((s) => s.duration_hours).filter((v): v is number => v != null);
  const avgSleep = sleepDurations.length ? sleepDurations.reduce((sum, v) => sum + v, 0) / sleepDurations.length : null;

  let daysToRace: number | null = null;
  if (nextRace) {
    daysToRace = Math.round((new Date(nextRace.event_date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
  }

  let todayPlan: { title: string; description: string | null; icon: string } | null = null;
  if (currentWeek) {
    const { data: item } = await supabase
      .from("health_training_plan_items")
      .select("title, description, icon")
      .eq("week_id", currentWeek.id)
      .eq("day_of_week", todayDayOfWeek)
      .maybeSingle();
    todayPlan = item ?? null;
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard label="This week" value={`${Math.round(weekMinutes)} min`} />
        <StatCard label="Avg sleep (7d)" value={avgSleep != null ? `${avgSleep.toFixed(1)}h` : "—"} />
        <StatCard label="Next race" value={daysToRace != null ? `${daysToRace}d` : "—"} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        {DAY_LABELS[todayDayOfWeek]}&rsquo;s training
      </h2>
      <Card className="mb-6">
        {todayPlan ? (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={todayPlan.icon} size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-charcoal">{todayPlan.title}</p>
              {todayPlan.description && <p className="text-sm text-charcoal-soft">{todayPlan.description}</p>}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-charcoal-soft">
            Nothing planned for today.{" "}
            <Link href="/health/training" className="font-semibold text-pink-dark">
              Set up this week&rsquo;s plan
            </Link>
            .
          </p>
        )}
      </Card>

      {nextRace && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Next race</h2>
          <Card className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name="flag" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-charcoal">{nextRace.name}</p>
              <p className="text-sm text-charcoal-soft">
                {formatDate(nextRace.event_date)}
                {nextRace.location && ` · ${nextRace.location}`}
              </p>
            </div>
          </Card>
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Recent activities</h2>
      <Card className="mb-6 space-y-1">
        {(recentActivities ?? []).length === 0 && (
          <p className="text-center text-sm text-charcoal-soft">No activities logged yet.</p>
        )}
        {(recentActivities ?? []).map((a) => (
          <div key={a.id} className="flex items-center gap-3 py-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={a.icon} size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal">{a.title}</p>
              <p className="text-xs text-charcoal-soft">
                {formatDate(a.performed_on)} · {a.activity_type}
                {a.duration_minutes ? ` · ${a.duration_minutes}min` : ""}
                {a.distance_km ? ` · ${a.distance_km}km` : ""}
              </p>
            </div>
          </div>
        ))}
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Go to</h2>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map(({ href, label, icon: LinkIcon }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <LinkIcon size={16} />
              </span>
              <p className="font-medium text-charcoal">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
