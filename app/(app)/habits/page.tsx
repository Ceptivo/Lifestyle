import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/ui/PageHeading";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitList, type Habit } from "@/components/habits/HabitList";
import { todayLocalDate } from "@/lib/format";

export const revalidate = 60;

const HISTORY_DAYS = 30;

function addDaysLocal(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayLetter(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "narrow" });
}

export default async function HabitsPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const historyStart = addDaysLocal(today, -HISTORY_DAYS);

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from("habits").select("*").order("created_at", { ascending: true }),
    supabase.from("habit_logs").select("habit_id, log_date").gte("log_date", historyStart).lte("log_date", today),
  ]);

  const logsByHabit = new Map<string, Set<string>>();
  for (const l of logs ?? []) {
    const set = logsByHabit.get(l.habit_id) ?? new Set<string>();
    set.add(l.log_date);
    logsByHabit.set(l.habit_id, set);
  }

  const last7Dates = Array.from({ length: 7 }, (_, i) => addDaysLocal(today, -(6 - i)));

  const rows: Habit[] = (habits ?? []).map((h) => {
    const dates = logsByHabit.get(h.id) ?? new Set<string>();
    const todayDone = dates.has(today);

    let streak = 0;
    let cursor = todayDone ? today : addDaysLocal(today, -1);
    while (dates.has(cursor)) {
      streak++;
      cursor = addDaysLocal(cursor, -1);
    }

    return {
      id: h.id,
      name: h.name,
      icon: h.icon,
      streak,
      todayDate: today,
      todayDone,
      last7: last7Dates.map((date) => ({ date, label: dayLetter(date), done: dates.has(date) })),
    };
  });

  return (
    <div>
      <PageHeading title="Habit Tracker" subtitle="Check off each habit as you go, and watch the streak build." />
      <div className="mb-6">
        <HabitForm />
      </div>
      <HabitList habits={rows} />
    </div>
  );
}
