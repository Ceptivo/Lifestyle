import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeading } from "@/components/ui/PageHeading";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { ActivityList, type ActivityItem } from "@/components/activities/ActivityList";
import { formatCurrency } from "@/lib/format";

export const revalidate = 60;

export default async function ActivitiesPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("activities_todo")
    .select("*")
    .order("done", { ascending: true })
    .order("created_at", { ascending: false });

  const rows: ActivityItem[] = (items ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    icon: i.icon,
    done: i.done,
    location: i.location,
    costLabel: i.cost_estimate != null ? `~${formatCurrency(i.cost_estimate)}` : null,
    notes: i.notes,
  }));

  return (
    <div>
      <BackLink href="/more" label="Back to More" />
      <PageHeading title="Activities to do" subtitle="Ideas for things to do, with cost and location." />
      <div className="mb-6">
        <ActivityForm />
      </div>
      <ActivityList items={rows} />
    </div>
  );
}
