import { createClient } from "@/lib/supabase/server";
import { LectureWeekView, type CalendarDay } from "@/components/university/LectureWeekView";
import { todayLocalDate } from "@/lib/format";
import { addDays, mondayOf } from "@/lib/university-calendar";

export const revalidate = 60;

// Term dates longer than this are term-level context (e.g. "Semester 2
// lectures" spanning 4 months) rather than a day-specific event — showing
// them as a banner on every single day would just be noise.
const MAX_BANNER_SPAN_DAYS = 25;

function daySpan(start: string, end: string): number {
  return (new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) / 86400000;
}

export default async function UniversityCalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const todayIso = todayLocalDate();
  const currentWeekMonday = mondayOf(todayIso);
  const monday = mondayOf(date || todayIso);
  const saturday = addDays(monday, 5);

  const supabase = createClient();
  const [{ data: modules }, { data: lectures }, { data: termDates }, { data: assignments }] = await Promise.all([
    supabase.from("university_modules").select("*"),
    supabase
      .from("university_lectures")
      .select("*")
      .gte("lecture_date", monday)
      .lte("lecture_date", saturday)
      .order("start_time"),
    supabase
      .from("university_term_dates")
      .select("*")
      .lte("start_date", saturday)
      .gte("end_date", monday),
    supabase
      .from("university_assignments")
      .select("*")
      .gte("due_date", monday)
      .lte("due_date", saturday),
  ]);

  const moduleById = new Map((modules ?? []).map((m) => [m.id, m]));

  const days: CalendarDay[] = Array.from({ length: 6 }, (_, i) => {
    const dateIso = addDays(monday, i);
    return {
      date: dateIso,
      lectures: (lectures ?? [])
        .filter((l) => l.lecture_date === dateIso)
        .map((l) => {
          const mod = moduleById.get(l.module_id);
          return {
            id: l.id,
            moduleCode: mod?.code ?? "",
            moduleName: mod?.name ?? "Lecture",
            moduleIcon: mod?.icon ?? "book-open",
            startTime: l.start_time,
            endTime: l.end_time,
            room: l.room,
            attended: l.attended,
          };
        }),
      assignments: (assignments ?? [])
        .filter((a) => a.due_date === dateIso)
        .map((a) => ({
          id: a.id,
          title: a.title,
          moduleCode: (a.module_id && moduleById.get(a.module_id)?.code) || null,
          flagged: a.flagged,
        })),
      banners: (termDates ?? [])
        .filter((t) => dateIso >= t.start_date && dateIso <= t.end_date && daySpan(t.start_date, t.end_date) <= MAX_BANNER_SPAN_DAYS)
        .map((t) => ({ label: t.label, icon: t.icon })),
    };
  });

  return <LectureWeekView monday={monday} saturday={saturday} days={days} todayIso={todayIso} currentWeekMonday={currentWeekMonday} />;
}
