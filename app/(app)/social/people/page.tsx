import { createClient } from "@/lib/supabase/server";
import { PersonForm } from "@/components/social/PersonForm";
import { PersonCard, type PersonCardData } from "@/components/social/PersonCard";
import { todayLocalDate } from "@/lib/format";
import { addDays, daysBetween } from "@/lib/social";

export const revalidate = 60;

export default async function PeoplePage() {
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: people }, { data: interactions }] = await Promise.all([
    supabase.from("social_people").select("*").order("name"),
    supabase.from("social_interactions").select("person_id, occurred_on").order("occurred_on", { ascending: false }),
  ]);

  const byPerson = new Map<string, { occurred_on: string }[]>();
  for (const i of interactions ?? []) {
    const list = byPerson.get(i.person_id) ?? [];
    list.push(i);
    byPerson.set(i.person_id, list);
  }

  const cards: PersonCardData[] = (people ?? []).map((p) => {
    const theirs = byPerson.get(p.id) ?? [];
    const windowStart = addDays(today, -p.interaction_period_days);
    const inWindow = theirs.filter((i) => i.occurred_on >= windowStart && i.occurred_on <= today).length;
    const pct = Math.min(100, (inWindow / p.interaction_target_count) * 100);
    const last = theirs[0];
    const daysSince = last ? daysBetween(last.occurred_on, today) : null;
    const overdue = daysSince == null || daysSince > p.interaction_period_days;

    return {
      id: p.id,
      name: p.name,
      relationshipType: p.relationship_type,
      icon: p.icon,
      pct,
      targetCount: p.interaction_target_count,
      periodDays: p.interaction_period_days,
      lastContactLabel: daysSince == null ? "No contact logged yet" : daysSince === 0 ? "Last contact: today" : `Last contact: ${daysSince}d ago`,
      overdue,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <PersonForm />
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-sm text-charcoal-soft">No one added yet. Add the first person you want to keep in touch with.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <PersonCard key={c.id} person={c} />
          ))}
        </div>
      )}
    </div>
  );
}
