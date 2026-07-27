import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deletePerson } from "@/app/actions/social";
import { Card, StatCard } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { InteractionForm } from "@/components/social/InteractionForm";
import { InteractionList } from "@/components/social/InteractionList";
import { CadenceEditor } from "@/components/social/CadenceEditor";
import { todayLocalDate, formatDate } from "@/lib/format";
import { addDays, daysBetween } from "@/lib/social";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: person }, { data: interactions }] = await Promise.all([
    supabase.from("social_people").select("*").eq("id", id).maybeSingle(),
    supabase.from("social_interactions").select("*").eq("person_id", id).order("occurred_on", { ascending: false }),
  ]);

  if (!person) notFound();

  const windowStart = addDays(today, -person.interaction_period_days);
  const inWindow = (interactions ?? []).filter((i) => i.occurred_on >= windowStart && i.occurred_on <= today).length;
  const pct = Math.min(100, (inWindow / person.interaction_target_count) * 100);
  const last = (interactions ?? [])[0];
  const daysSince = last ? daysBetween(last.occurred_on, today) : null;

  const interactionRows = (interactions ?? []).map((i) => ({
    id: i.id,
    occurredOnFormatted: formatDate(i.occurred_on),
    interactionType: i.interaction_type,
    notes: i.notes,
  }));

  return (
    <div>
      <Link href="/social/people" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-charcoal-soft hover:text-charcoal">
        <ChevronLeft size={16} />
        Back to People
      </Link>

      <Card className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={person.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-charcoal">{person.name}</p>
          <p className="text-sm capitalize text-charcoal-soft">{person.relationship_type}</p>
        </div>
        <form action={deletePerson.bind(null, person.id)}>
          <button type="submit" aria-label="Delete person" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
            <Trash2 size={16} />
          </button>
        </form>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="This period" value={`${inWindow} / ${person.interaction_target_count}`} />
        <StatCard label="Last contact" value={daysSince == null ? "—" : `${daysSince}d ago`} />
      </div>

      <Card className="mb-6">
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-pink" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-charcoal-soft">
            Goal: {person.interaction_target_count}x every {person.interaction_period_days} days
          </p>
          <CadenceEditor
            personId={person.id}
            targetCount={person.interaction_target_count}
            periodDays={person.interaction_period_days}
            notes={person.notes}
          />
        </div>
        {person.notes && <p className="mt-2 text-sm text-charcoal-soft">{person.notes}</p>}
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Interactions</h2>
      <div className="mb-4">
        <InteractionForm personId={person.id} />
      </div>
      <InteractionList interactions={interactionRows} />
    </div>
  );
}
