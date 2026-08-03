import { createClient } from "@/lib/supabase/server";
import { OccasionForm } from "@/components/social/OccasionForm";
import { OccasionList, type OccasionRow } from "@/components/social/OccasionList";
import { todayLocalDate, formatDate } from "@/lib/format";
import { nextOccurrence, daysBetween } from "@/lib/social";

export const revalidate = 60;

export default async function OccasionsPage() {
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: occasions }, { data: people }] = await Promise.all([
    supabase.from("social_occasions").select("*"),
    supabase.from("social_people").select("id, name").order("name"),
  ]);

  const peopleById = Object.fromEntries((people ?? []).map((p) => [p.id, p.name]));

  const rows: OccasionRow[] = (occasions ?? [])
    .map((o) => {
      const next = nextOccurrence(o.occasion_date, today, o.recurring);
      const daysUntil = daysBetween(today, next);
      return {
        id: o.id,
        label: o.label,
        personName: (o.person_id ? peopleById[o.person_id] : o.person_name) ?? "Someone",
        icon: o.icon,
        nextDate: next,
        nextOccurrenceFormatted: formatDate(next),
        daysUntilLabel: daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`,
        giftIdeas: o.gift_ideas,
      };
    })
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  return (
    <div>
      <div className="mb-6">
        <OccasionForm people={people ?? []} />
      </div>
      <OccasionList occasions={rows} />
    </div>
  );
}
