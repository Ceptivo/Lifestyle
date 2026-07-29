import { createClient } from "@/lib/supabase/server";
import { UniversityGoalForm } from "@/components/university/UniversityGoalForm";
import { UniversityGoalList, type UniversityGoal } from "@/components/university/UniversityGoalList";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function UniversityGoalsPage() {
  const supabase = createClient();
  const { data: goals } = await supabase.from("university_goals").select("*").order("created_at", { ascending: false });

  const goalRows: UniversityGoal[] = (goals ?? []).map((g) => ({
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
        <UniversityGoalForm />
      </div>
      <UniversityGoalList goals={goalRows} />
    </div>
  );
}
