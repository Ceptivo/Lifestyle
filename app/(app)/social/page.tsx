import Link from "next/link";
import { Users, Target, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { todayLocalDate, formatDate } from "@/lib/format";
import { daysBetween, nextOccurrence } from "@/lib/social";

export const revalidate = 60;

const QUICK_LINKS = [
  { href: "/social/people", label: "People", icon: Users },
  { href: "/social/goals", label: "Goals", icon: Target },
  { href: "/social/occasions", label: "Occasions", icon: Gift },
];

export default async function SocialOverviewPage() {
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: people }, { data: interactions }, { data: occasions }, { data: goals }] = await Promise.all([
    supabase.from("social_people").select("*"),
    supabase.from("social_interactions").select("person_id, occurred_on").order("occurred_on", { ascending: false }),
    supabase.from("social_occasions").select("*"),
    supabase.from("social_shared_goals").select("*").neq("status", "done"),
  ]);

  const lastContactByPerson = new Map<string, string>();
  for (const i of interactions ?? []) {
    if (!lastContactByPerson.has(i.person_id)) lastContactByPerson.set(i.person_id, i.occurred_on);
  }

  const overduePeople = (people ?? [])
    .map((p) => {
      const last = lastContactByPerson.get(p.id);
      const daysSince = last ? daysBetween(last, today) : null;
      return { ...p, daysSince };
    })
    .filter((p) => p.daysSince == null || p.daysSince > p.interaction_period_days)
    .sort((a, b) => (b.daysSince ?? 9999) - (a.daysSince ?? 9999))
    .slice(0, 5);

  const upcomingOccasions = (occasions ?? [])
    .map((o) => {
      const next = nextOccurrence(o.occasion_date, today, o.recurring);
      return { ...o, next, daysUntil: daysBetween(today, next) };
    })
    .sort((a, b) => a.next.localeCompare(b.next))
    .slice(0, 3);

  const peopleById = Object.fromEntries((people ?? []).map((p) => [p.id, p.name]));

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Keep in touch</h2>
      <Card className="mb-6 space-y-1">
        {overduePeople.length === 0 ? (
          <p className="text-center text-sm text-charcoal-soft">You&rsquo;re all caught up — nice work.</p>
        ) : (
          overduePeople.map((p) => (
            <Link key={p.id} href={`/social/people/${p.id}`} className="flex items-center gap-3 py-1.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                <Icon name={p.icon} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-charcoal">{p.name}</p>
                <p className="text-xs text-charcoal-soft">
                  {p.daysSince == null ? "No contact logged yet" : `${p.daysSince}d since last contact`}
                </p>
              </div>
            </Link>
          ))
        )}
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Upcoming occasions</h2>
      <Card className="mb-6 space-y-1">
        {upcomingOccasions.length === 0 ? (
          <p className="text-center text-sm text-charcoal-soft">No occasions tracked yet.</p>
        ) : (
          upcomingOccasions.map((o) => (
            <div key={o.id} className="flex items-center gap-3 py-1.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <Icon name={o.icon} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-charcoal">
                  {o.label} · {peopleById[o.person_id] ?? "Someone"}
                </p>
                <p className="text-xs text-charcoal-soft">
                  {formatDate(o.next)} · {o.daysUntil === 0 ? "Today!" : o.daysUntil === 1 ? "Tomorrow" : `In ${o.daysUntil} days`}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>

      {(goals ?? []).length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Shared goals in progress</h2>
          <Card className="mb-6 space-y-1">
            {(goals ?? []).slice(0, 5).map((g) => (
              <div key={g.id} className="flex items-center gap-3 py-1.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Icon name={g.icon} size={14} />
                </span>
                <p className="truncate text-sm font-medium text-charcoal">{g.name}</p>
              </div>
            ))}
          </Card>
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Go to</h2>
      <div className="grid grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ href, label, icon: LinkIcon }) => (
          <Link key={href} href={href}>
            <Card className="flex flex-col items-center gap-2 px-3 py-3.5 text-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <LinkIcon size={16} />
              </span>
              <p className="text-xs font-medium text-charcoal">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
