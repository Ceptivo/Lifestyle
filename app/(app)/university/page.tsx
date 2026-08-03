import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { LectureDayList, type DayLecture } from "@/components/university/LectureDayList";
import { formatDate, todayLocalDate } from "@/lib/format";
import { daysBetween } from "@/lib/social";

export const revalidate = 60;

const QUICK_LINKS = [
  { href: "/university/study-material", label: "Study Material", icon: "book-open" },
  { href: "/university/assignments", label: "Assignments", icon: "clipboard-list" },
  { href: "/university/exams", label: "Exams", icon: "calendar-days" },
  { href: "/university/calendar", label: "Calendar", icon: "graduation-cap" },
  { href: "/university/attendance", label: "Attendance", icon: "list-checks" },
  { href: "/university/grades", label: "Report Card", icon: "pie-chart" },
  { href: "/university/goals", label: "Goals", icon: "target" },
];

export default async function UniversityOverviewPage() {
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: modules }, { data: todayLectures }, { data: nextAssignment }, { data: nextExam }, { data: grades }] = await Promise.all([
    supabase.from("university_modules").select("id, code, name, icon"),
    supabase.from("university_lectures").select("id, start_time, end_time, room, module_id, attended").eq("lecture_date", today).order("start_time"),
    supabase.from("university_assignments").select("*").not("due_date", "is", null).gte("due_date", today).order("due_date").limit(1).maybeSingle(),
    supabase.from("university_exams").select("*").gte("exam_date", today).order("exam_date").limit(1).maybeSingle(),
    supabase.from("university_grades").select("mark, max_mark"),
  ]);

  const moduleById = new Map((modules ?? []).map((m) => [m.id, m]));
  const todayLectureRows: DayLecture[] = (todayLectures ?? []).map((l) => {
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
  });

  const assignmentDaysUntil = nextAssignment ? daysBetween(today, nextAssignment.due_date!) : null;
  const assignmentModule = nextAssignment?.module_id ? moduleById.get(nextAssignment.module_id) : null;
  const examDaysUntil = nextExam ? daysBetween(today, nextExam.exam_date) : null;

  const markSum = (grades ?? []).reduce((sum, g) => sum + g.mark, 0);
  const maxSum = (grades ?? []).reduce((sum, g) => sum + g.max_mark, 0);
  const avgGrade = maxSum > 0 ? Math.round((markSum / maxSum) * 100) : null;

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard label="Next due" value={assignmentDaysUntil != null ? `${assignmentDaysUntil}d` : "—"} />
        <StatCard label="Next exam" value={examDaysUntil != null ? `${examDaysUntil}d` : "—"} />
        <StatCard label="Avg grade" value={avgGrade != null ? `${avgGrade}%` : "—"} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Today&rsquo;s lectures</h2>
      <Card className="mb-6">
        <LectureDayList lectures={todayLectureRows} attendance />
      </Card>

      {(nextAssignment || nextExam) && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Up next</h2>
          <Card className="mb-6 space-y-1">
            {nextAssignment && (
              <Link href="/university/assignments" className="flex items-center gap-3 rounded-xl py-1.5 hover:bg-cream">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${nextAssignment.flagged ? "bg-danger-soft text-danger" : "bg-pink-soft text-pink-dark"}`}
                >
                  <Icon name={nextAssignment.flagged ? "flag" : "clipboard-list"} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-charcoal">
                    {nextAssignment.title}
                    {assignmentModule && ` · ${assignmentModule.name}`}
                  </p>
                  <p className="truncate text-sm text-charcoal-soft">
                    Due {formatDate(nextAssignment.due_date!)} · {assignmentDaysUntil}d
                  </p>
                </div>
              </Link>
            )}
            {nextExam && (
              <Link href="/university/exams" className="flex items-center gap-3 rounded-xl py-1.5 hover:bg-cream">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Icon name={nextExam.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-charcoal">
                    {nextExam.title} · {nextExam.subject}
                  </p>
                  <p className="truncate text-sm text-charcoal-soft">
                    {formatDate(nextExam.exam_date)} · {examDaysUntil}d
                  </p>
                </div>
              </Link>
            )}
          </Card>
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Go to</h2>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map(({ href, label, icon }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <Icon name={icon} size={16} />
              </span>
              <p className="font-medium text-charcoal">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
