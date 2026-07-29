import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { FinanceMenuDrawer } from "@/components/finance/FinanceMenuDrawer";
import { todayLocalDate, formatDate } from "@/lib/format";
import { mondayOf, addDays, DAY_LABELS } from "@/lib/health";

export const revalidate = 60;

const HEALTH_LINKS = [
  { href: "/health/training", label: "Training", icon: "dumbbell" },
  { href: "/health/sleep", label: "Sleep", icon: "moon" },
  { href: "/health/journal", label: "Journal", icon: "pill" },
  { href: "/health/races", label: "Races", icon: "flag" },
  { href: "/health/goals", label: "Goals", icon: "target" },
  { href: "/health/analytics", label: "Analytics", icon: "pie-chart" },
];

export default async function HealthOverviewPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const weekStart = mondayOf(today);
  const weekEnd = addDays(weekStart, 6);
  const sleepWindowStart = addDays(today, -6);
  const todayDayOfWeek = (new Date(today + "T00:00:00").getDay() + 6) % 7;

  const [{ data: weekActivities }, { data: sleepLogs }, { data: nextRace }, { data: planRow }, { data: recentActivities }] =
    await Promise.all([
      supabase.from("health_activities").select("duration_minutes").gte("performed_on", weekStart).lte("performed_on", weekEnd),
      supabase.from("health_sleep_logs").select("sleep_date, duration_hours").gte("sleep_date", sleepWindowStart).lte("sleep_date", today),
      supabase
        .from("health_races")
        .select("id, name, event_date, location")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("health_training_plan").select("title, description, icon").eq("day_of_week", todayDayOfWeek).maybeSingle(),
      supabase
        .from("health_activities")
        .select("id, title, activity_type, performed_on, duration_minutes, distance_km, icon")
        .order("performed_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const weekMinutes = (weekActivities ?? []).reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0);
  const weekHours = weekMinutes / 60;
  const sleepDurations = (sleepLogs ?? []).map((s) => s.duration_hours).filter((v): v is number => v != null);
  const avgSleep = sleepDurations.length ? sleepDurations.reduce((sum, v) => sum + v, 0) / sleepDurations.length : null;
  const todaySleepLogged = (sleepLogs ?? []).some((s) => s.sleep_date === today);

  let daysToRace: number | null = null;
  if (nextRace) {
    daysToRace = Math.round((new Date(nextRace.event_date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
  }

  const todayPlan = planRow ?? null;

  const reminders: { id: string; icon: string; title: string; body: string; href: string; alert: boolean }[] = [];
  reminders.push({
    id: "training",
    icon: todayPlan?.icon ?? "dumbbell",
    title: `${DAY_LABELS[todayDayOfWeek]}'s training`,
    body: todayPlan ? todayPlan.title : "Nothing planned — set up this week's plan",
    href: "/health/training",
    alert: false,
  });
  reminders.push({
    id: "sleep",
    icon: "moon",
    title: todaySleepLogged ? "Sleep logged" : "Log last night's sleep",
    body: todaySleepLogged ? "Today's entry is in" : "Not logged yet — takes 10 seconds",
    href: "/health/sleep",
    alert: !todaySleepLogged,
  });
  if (nextRace && daysToRace != null && daysToRace <= 7) {
    reminders.push({
      id: "race",
      icon: "flag",
      title: `${nextRace.name} in ${daysToRace}d`,
      body: nextRace.location ?? "Race day is coming up",
      href: "/health/races",
      alert: daysToRace <= 2,
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Health</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Training, sleep, and how you&rsquo;re feeling.</p>
        </div>
        <FinanceMenuDrawer links={HEALTH_LINKS} title="Health" />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard label="Trained (wk)" value={`${weekHours.toFixed(1)}h`} />
        <StatCard label="Avg sleep (7d)" value={avgSleep != null ? `${avgSleep.toFixed(1)}h` : "—"} />
        <StatCard label="Next race" value={daysToRace != null ? `${daysToRace}d` : "—"} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Today&rsquo;s health reminders</h2>
      <Card className="mb-6 space-y-1">
        {reminders.map((r) => (
          <Link key={r.id} href={r.href} className="flex items-center gap-3 rounded-xl py-1.5 hover:bg-cream">
            <span
              className={
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
                (r.alert ? "bg-danger-soft text-danger" : "bg-pink-soft text-pink-dark")
              }
            >
              <Icon name={r.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-charcoal">{r.title}</p>
              <p className="truncate text-sm text-charcoal-soft">{r.body}</p>
            </div>
          </Link>
        ))}
      </Card>

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
    </div>
  );
}
