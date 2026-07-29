import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeading } from "@/components/ui/PageHeading";
import { SpecialForm } from "@/components/restaurant/SpecialForm";
import { SpecialsByDay, type SpecialItem } from "@/components/restaurant/SpecialsByDay";
import { formatCurrency, todayWeekday } from "@/lib/format";

export const revalidate = 60;

export default async function RestaurantSaversPage() {
  const supabase = createClient();
  const { data: specials } = await supabase
    .from("restaurant_specials")
    .select("*")
    .order("restaurant_name", { ascending: true });

  const rows: SpecialItem[] = (specials ?? []).map((s) => ({
    id: s.id,
    dayOfWeek: s.day_of_week,
    restaurantName: s.restaurant_name,
    itemName: s.item_name,
    icon: s.icon,
    priceLabel: s.price != null ? formatCurrency(s.price) : null,
    notes: s.notes,
  }));

  const today = todayWeekday();

  return (
    <div>
      <BackLink href="/more" label="Back to More" />
      <PageHeading title="Restaurant Savers" subtitle="Daily food specials, every day of the week." />
      <div className="mb-6">
        <SpecialForm defaultDay={today} />
      </div>
      <SpecialsByDay items={rows} defaultDay={today} />
    </div>
  );
}
