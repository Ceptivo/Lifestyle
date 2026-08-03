import { createClient } from "@/lib/supabase/server";
import { AssignmentForm, type ModuleOption } from "@/components/university/AssignmentForm";
import { AssignmentList, type Assignment, type AssignmentMonthGroup } from "@/components/university/AssignmentList";
import { formatDate, todayLocalDate } from "@/lib/format";
import { daysBetween } from "@/lib/social";

export const revalidate = 60;

export default async function AssignmentsPage() {
  const supabase = createClient();
  const [{ data: assignments }, { data: modules }] = await Promise.all([
    supabase.from("university_assignments").select("*").order("due_date"),
    supabase.from("university_modules").select("id, code, name").order("code"),
  ]);

  const today = todayLocalDate();
  const moduleOptions: ModuleOption[] = modules ?? [];
  const moduleById = new Map(moduleOptions.map((m) => [m.id, m]));

  const rows: Assignment[] = (assignments ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    moduleCode: (a.module_id && moduleById.get(a.module_id)?.code) || null,
    dueDate: a.due_date,
    dueDateFormatted: a.due_date ? formatDate(a.due_date) : null,
    dueTime: a.due_time,
    daysUntil: a.due_date ? daysBetween(today, a.due_date) : null,
    notes: a.notes,
    status: a.status,
    flagged: a.flagged,
    overdue: a.status !== "graded" && a.due_date != null && a.due_date < today,
  }));

  const byMonth = new Map<string, Assignment[]>();
  const tbc: Assignment[] = [];
  for (const a of rows) {
    if (!a.dueDate) {
      tbc.push(a);
      continue;
    }
    const monthKey = new Date(a.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bucket = byMonth.get(monthKey) ?? [];
    bucket.push(a);
    byMonth.set(monthKey, bucket);
  }

  const groups: AssignmentMonthGroup[] = [...byMonth.entries()].map(([month, monthAssignments]) => ({ month, assignments: monthAssignments }));
  if (tbc.length > 0) groups.push({ month: "TBC", assignments: tbc });

  return (
    <div>
      <div className="mb-6">
        <AssignmentForm modules={moduleOptions} />
      </div>
      <AssignmentList groups={groups} />
    </div>
  );
}
