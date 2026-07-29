import { createClient } from "@/lib/supabase/server";
import { TaskForm } from "@/components/work/TaskForm";
import { TaskList, type Task } from "@/components/work/TaskList";
import { formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

export default async function WorkTasksPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const { data: tasks } = await supabase.from("work_tasks").select("*").order("created_at", { ascending: false });

  const sorted = [...(tasks ?? [])].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.due_date && b.due_date) return a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0;
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  });

  const rows: Task[] = sorted.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    done: t.done,
    priority: t.priority,
    dueDateFormatted: t.due_date ? formatDate(t.due_date) : null,
    overdue: t.due_date ? t.due_date < today : false,
  }));

  return (
    <div>
      <div className="mb-6">
        <TaskForm />
      </div>
      <TaskList tasks={rows} />
    </div>
  );
}
