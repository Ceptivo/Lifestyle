import { createClient } from "@/lib/supabase/server";
import { WorkSubNav } from "@/components/work/WorkSubNav";
import { WorkGoalsPanel } from "@/components/work/WorkGoalsPanel";
import { type WorkGoal } from "@/components/work/WorkGoalList";
import { formatDate } from "@/lib/format";

export default async function WorkLayout({ children }: { children: React.ReactNode }) {
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
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Work</h1>
        <WorkGoalsPanel goals={goalRows} />
      </div>
      <p className="mb-6 text-sm text-charcoal-soft">Instruction checklists from Scott, and your goals.</p>
      <WorkSubNav />
      {children}
    </div>
  );
}
