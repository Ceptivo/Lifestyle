import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeading } from "@/components/ui/PageHeading";
import { SpecialForm } from "@/components/restaurant/SpecialForm";
import { SpecialsByDay, type SpecialItem } from "@/components/restaurant/SpecialsByDay";
import { LunchOptionsPanel, type LunchOption } from "@/components/restaurant/LunchOptionsPanel";
import { formatCurrency, todayWeekday } from "@/lib/format";

export const revalidate = 60;

export default async function RestaurantSaversPage() {
  const supabase = createClient();
  const [{ data: specials }, { data: lunchOptions }] = await Promise.all([
    supabase.from("restaurant_specials").select("*").order("restaurant_name", { ascending: true }),
    supabase.from("lunch_options").select("*").order("created_at", { ascending: false }),
  ]);

  const rows: SpecialItem[] = (specials ?? []).map((s) => ({
    id: s.id,
    dayOfWeek: s.day_of_week,
    restaurantName: s.restaurant_name,
    itemName: s.item_name,
    icon: s.icon,
    price: s.price,
    priceLabel: s.price != null ? formatCurrency(s.price) : null,
    notes: s.notes,
  }));

  const lunchOptionRows: LunchOption[] = (lunchOptions ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    notes: l.notes,
    icon: l.icon,
    category: l.category,
    price: l.price,
    rating: l.rating,
  }));

  const today = todayWeekday();

  return (
    <div>
      <BackLink href="/more" label="Back to More" />
      <div className="flex items-start justify-between gap-3">
        <PageHeading title="Restaurant Savers" subtitle="Daily food specials, every day of the week." />
        <LunchOptionsPanel options={lunchOptionRows} />
      </div>
      <div className="mb-6">
        <SpecialForm defaultDay={today} />
      </div>
      <SpecialsByDay items={rows} defaultDay={today} />
    </div>
  );
}
