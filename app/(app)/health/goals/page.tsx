import { createClient } from "@/lib/supabase/server";
import { HealthGoalForm } from "@/components/health/HealthGoalForm";
import { HealthGoalList, type HealthGoal } from "@/components/health/HealthGoalList";
import { BackLink } from "@/components/ui/BackLink";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function HealthGoalsPage() {
  const supabase = createClient();
  const { data: goals } = await supabase.from("health_goals").select("*").order("created_at", { ascending: false });

  const goalRows: HealthGoal[] = (goals ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    icon: g.icon,
    status: g.status,
    targetDateFormatted: g.target_date ? formatDate(g.target_date) : null,
  }));

  return (
    <div>
      <BackLink href="/health" label="Back to Health" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Goals</h1>

      <div className="mb-6">
        <HealthGoalForm />
      </div>
      <HealthGoalList goals={goalRows} />
    </div>
  );
}
