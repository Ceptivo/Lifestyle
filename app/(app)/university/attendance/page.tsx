import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { AttendanceList, type AttendanceMonthGroup } from "@/components/university/AttendanceList";
import { todayLocalDate, formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function AttendancePage() {
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: modules }, { data: lectures }] = await Promise.all([
    supabase.from("university_modules").select("id, code, name, icon"),
    supabase.from("university_lectures").select("*").lte("lecture_date", today).order("lecture_date", { ascending: false }),
  ]);

  const moduleById = new Map((modules ?? []).map((m) => [m.id, m]));

  const totalHeld = lectures?.length ?? 0;
  const totalAttended = (lectures ?? []).filter((l) => l.attended).length;
  const overallPct = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : null;

  const perModule = new Map<string, { held: number; attended: number }>();
  for (const l of lectures ?? []) {
    const bucket = perModule.get(l.module_id) ?? { held: 0, attended: 0 };
    bucket.held += 1;
    if (l.attended) bucket.attended += 1;
    perModule.set(l.module_id, bucket);
  }

  const moduleStats = [...perModule.entries()]
    .map(([moduleId, s]) => ({
      code: moduleById.get(moduleId)?.code ?? "?",
      attended: s.attended,
      held: s.held,
      pct: s.held > 0 ? Math.round((s.attended / s.held) * 100) : 0,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const byMonth = new Map<string, AttendanceMonthGroup["lectures"]>();
  for (const l of lectures ?? []) {
    const monthKey = new Date(l.lecture_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const mod = moduleById.get(l.module_id);
    const bucket = byMonth.get(monthKey) ?? [];
    bucket.push({
      id: l.id,
      dateFormatted: formatDate(l.lecture_date),
      moduleCode: mod?.code ?? "",
      moduleName: mod?.name ?? "Lecture",
      moduleIcon: mod?.icon ?? "book-open",
      startTime: l.start_time,
      endTime: l.end_time,
      attended: l.attended,
    });
    byMonth.set(monthKey, bucket);
  }

  const groups: AttendanceMonthGroup[] = [...byMonth.entries()].map(([month, monthLectures]) => ({ month, lectures: monthLectures }));

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Attendance" value={overallPct != null ? `${overallPct}%` : "—"} />
        <StatCard label="Attended" value={`${totalAttended}/${totalHeld}`} />
      </div>

      {moduleStats.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">By module</h2>
          <Card className="mb-6 space-y-2">
            {moduleStats.map((m) => (
              <div key={m.code} className="flex items-center justify-between text-sm">
                <span className="text-charcoal">{m.code}</span>
                <span className="font-semibold text-charcoal-soft">
                  {m.attended}/{m.held} · {m.pct}%
                </span>
              </div>
            ))}
          </Card>
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Record</h2>
      <AttendanceList groups={groups} />
    </div>
  );
}
