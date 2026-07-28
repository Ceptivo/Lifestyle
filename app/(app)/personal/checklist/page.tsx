import { createClient } from "@/lib/supabase/server";
import { AdminTaskForm } from "@/components/personal/AdminTaskForm";
import { AdminTaskList, type AdminTask } from "@/components/personal/AdminTaskList";
import { formatDate, todayLocalDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const { data: tasks } = await supabase.from("personal_admin_tasks").select("*").order("due_date", { ascending: true });

  const rows: AdminTask[] = (tasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    notes: t.notes,
    icon: t.icon,
    dueDateFormatted: formatDate(t.due_date),
    overdue: t.due_date < today,
    recurring: t.recurring,
  }));

  return (
    <div>
      <div className="mb-6">
        <AdminTaskForm />
      </div>
      <AdminTaskList tasks={rows} />
    </div>
  );
}
