import { createClient } from "@/lib/supabase/server";
import { BucketListForm } from "@/components/travel/BucketListForm";
import { BucketList, type BucketListItem } from "@/components/travel/BucketList";
import { formatCurrency, formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function BucketListPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("travel_bucket_list")
    .select("*")
    .order("achieved", { ascending: true })
    .order("created_at", { ascending: false });

  const rows: BucketListItem[] = (items ?? []).map((i) => ({
    id: i.id,
    title: i.title,
    icon: i.icon,
    achieved: i.achieved,
    targetDateLabel: i.target_date ? formatDate(i.target_date) : null,
    costLabel: i.estimated_cost != null ? `~${formatCurrency(i.estimated_cost)}` : null,
    notes: i.notes,
  }));

  return (
    <div>
      <div className="mb-6">
        <BucketListForm />
      </div>
      <BucketList items={rows} />
    </div>
  );
}
