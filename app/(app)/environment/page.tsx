import { createClient } from "@/lib/supabase/server";
import { MaintenanceForm } from "@/components/environment/MaintenanceForm";
import { MaintenanceList, type MaintenanceTask } from "@/components/environment/MaintenanceList";
import { formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

export default async function MaintenancePage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const { data: tasks } = await supabase
    .from("home_maintenance_tasks")
    .select("*")
    .order("next_due_date", { ascending: true });

  const rows: MaintenanceTask[] = (tasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    icon: t.icon,
    intervalDays: t.interval_days,
    dueDateFormatted: formatDate(t.next_due_date),
    overdue: t.next_due_date < today,
  }));

  return (
    <div>
      <div className="mb-6">
        <MaintenanceForm />
      </div>
      <MaintenanceList tasks={rows} />
    </div>
  );
}
