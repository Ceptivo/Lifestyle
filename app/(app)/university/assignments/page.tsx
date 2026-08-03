import { createClient } from "@/lib/supabase/server";
import { AssignmentForm, type ModuleOption } from "@/components/university/AssignmentForm";
import { AssignmentList, type Assignment } from "@/components/university/AssignmentList";
import { formatDate, todayLocalDate } from "@/lib/format";

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
    dueDateFormatted: a.due_date ? formatDate(a.due_date) : null,
    notes: a.notes,
    status: a.status,
    flagged: a.flagged,
    overdue: a.status !== "graded" && a.due_date != null && a.due_date < today,
  }));

  return (
    <div>
      <div className="mb-6">
        <AssignmentForm modules={moduleOptions} />
      </div>
      <AssignmentList assignments={rows} />
    </div>
  );
}
