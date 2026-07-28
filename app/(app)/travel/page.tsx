import Link from "next/link";
import { Plane, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatDate, todayLocalDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { href: "/travel/trips", label: "Trips", icon: Plane },
  { href: "/travel/bucket-list", label: "Bucket List", icon: Star },
];

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export default async function TravelOverviewPage() {
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: nextTrip }, { data: bucketItems }] = await Promise.all([
    supabase.from("travel_trips").select("*").gte("start_date", today).order("start_date", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("travel_bucket_list").select("*").eq("achieved", false).order("created_at", { ascending: false }).limit(3),
  ]);

  const daysUntil = nextTrip ? daysBetween(today, nextTrip.start_date) : null;
  const savingsPct = nextTrip && nextTrip.savings_goal_amount > 0 ? Math.min(100, (nextTrip.savings_current_amount / nextTrip.savings_goal_amount) * 100) : 0;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Next trip</h2>
      {nextTrip ? (
        <Link href={`/travel/trips/${nextTrip.id}`}>
          <Card className="mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <Icon name={nextTrip.icon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-charcoal">{nextTrip.name}</p>
                <p className="text-xs text-charcoal-soft">
                  {nextTrip.destination && `${nextTrip.destination} · `}
                  {formatDate(nextTrip.start_date)}
                </p>
              </div>
              <p className="shrink-0 text-lg font-bold text-pink-dark">{daysUntil}d</p>
            </div>
            {nextTrip.savings_goal_amount > 0 && (
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-cream">
                  <div className="h-full rounded-full bg-pink" style={{ width: `${savingsPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-charcoal-soft">
                  {formatCurrency(nextTrip.savings_current_amount)} of {formatCurrency(nextTrip.savings_goal_amount)} saved
                </p>
              </div>
            )}
          </Card>
        </Link>
      ) : (
        <Card className="mb-6">
          <p className="text-center text-sm text-charcoal-soft">No upcoming trips planned yet.</p>
        </Card>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Bucket list</h2>
      <Card className="mb-6 space-y-1">
        {(bucketItems ?? []).length === 0 ? (
          <p className="text-center text-sm text-charcoal-soft">Nothing on the bucket list yet.</p>
        ) : (
          (bucketItems ?? []).map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-1.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <Icon name={b.icon} size={14} />
              </span>
              <p className="truncate text-sm font-medium text-charcoal">{b.title}</p>
            </div>
          ))
        )}
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Go to</h2>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map(({ href, label, icon: LinkIcon }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                <LinkIcon size={16} />
              </span>
              <p className="font-medium text-charcoal">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
