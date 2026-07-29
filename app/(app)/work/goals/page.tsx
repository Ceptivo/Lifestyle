import { createClient } from "@/lib/supabase/server";
import { WorkGoalForm } from "@/components/work/WorkGoalForm";
import { WorkGoalList, type WorkGoal } from "@/components/work/WorkGoalList";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function WorkGoalsPage() {
  const supabase = createClient();
  const { data: goals } = await supabase.from("work_goals").select("*").order("created_at", { ascending: false });

  const goalRows: WorkGoal[] = (goals ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    icon: g.icon,
    status: g.status,
    targetDateFormatted: g.target_date ? formatDate(g.target_date) : null,
  }));

  return (
    <div>
      <div className="mb-6">
        <WorkGoalForm />
      </div>
      <WorkGoalList goals={goalRows} />
    </div>
  );
}
