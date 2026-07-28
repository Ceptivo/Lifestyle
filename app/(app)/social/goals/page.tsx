import { createClient } from "@/lib/supabase/server";
import { SharedGoalForm } from "@/components/social/SharedGoalForm";
import { SharedGoalList, type SharedGoal } from "@/components/social/SharedGoalList";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function SocialGoalsPage() {
  const supabase = createClient();
  const [{ data: goals }, { data: people }] = await Promise.all([
    supabase.from("social_shared_goals").select("*").order("created_at", { ascending: false }),
    supabase.from("social_people").select("id, name").order("name"),
  ]);

  const peopleById = Object.fromEntries((people ?? []).map((p) => [p.id, p.name]));

  const goalRows: SharedGoal[] = (goals ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    icon: g.icon,
    status: g.status,
    personName: g.person_id ? peopleById[g.person_id] ?? null : null,
    targetDateFormatted: g.target_date ? formatDate(g.target_date) : null,
  }));

  return (
    <div>
      <div className="mb-6">
        <SharedGoalForm people={people ?? []} />
      </div>
      <SharedGoalList goals={goalRows} />
    </div>
  );
}
