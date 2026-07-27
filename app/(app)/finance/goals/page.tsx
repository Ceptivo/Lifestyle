import { createClient } from "@/lib/supabase/server";
import { GoalForm } from "@/components/finance/GoalForm";
import { GoalList } from "@/components/finance/GoalList";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const supabase = createClient();
  const { data: goals } = await supabase
    .from("finance_goals")
    .select("id, name, icon, target_amount, current_amount, target_date")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <GoalForm />
      </div>

      <GoalList
        goals={(goals ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          targetDate: g.target_date,
        }))}
      />
    </div>
  );
}
