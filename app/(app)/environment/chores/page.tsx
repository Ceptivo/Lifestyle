import { createClient } from "@/lib/supabase/server";
import { ChoreForm } from "@/components/environment/ChoreForm";
import { ChoreList, type Chore } from "@/components/environment/ChoreList";

export const revalidate = 60;

export default async function ChoresPage() {
  const supabase = createClient();
  const { data: chores } = await supabase
    .from("home_chores")
    .select("*")
    .order("completed", { ascending: true })
    .order("created_at", { ascending: false });

  const rows: Chore[] = (chores ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    notes: c.notes,
    recurring: c.recurring,
    intervalDays: c.interval_days,
    completed: c.completed,
  }));

  return (
    <div>
      <div className="mb-6">
        <ChoreForm />
      </div>
      <ChoreList chores={rows} />
    </div>
  );
}
