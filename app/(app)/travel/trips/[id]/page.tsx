import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteTrip } from "@/app/actions/travel";
import { Card, StatCard } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PackingList } from "@/components/travel/PackingList";
import { ItineraryList } from "@/components/travel/ItineraryList";
import { SavingsProgressForm } from "@/components/travel/SavingsProgressForm";
import { formatCurrency, formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  const today = todayLocalDate();

  const [{ data: trip }, { data: packing }, { data: itinerary }] = await Promise.all([
    supabase.from("travel_trips").select("*").eq("id", id).maybeSingle(),
    supabase.from("travel_packing_items").select("*").eq("trip_id", id).order("created_at"),
    supabase.from("travel_itinerary_items").select("*").eq("trip_id", id).order("item_date").order("item_time"),
  ]);

  if (!trip) notFound();

  const daysUntil = daysBetween(today, trip.start_date);
  const savingsPct = trip.savings_goal_amount > 0 ? Math.min(100, (trip.savings_current_amount / trip.savings_goal_amount) * 100) : 0;
  const packedCount = (packing ?? []).filter((p) => p.packed).length;

  return (
    <div>
      <Link href="/travel/trips" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-charcoal-soft hover:text-charcoal">
        <ChevronLeft size={16} />
        Back to Trips
      </Link>

      <Card className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={trip.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-charcoal">{trip.name}</p>
          <p className="text-sm text-charcoal-soft">
            {trip.destination && `${trip.destination} · `}
            {trip.end_date ? `${formatDate(trip.start_date)} – ${formatDate(trip.end_date)}` : formatDate(trip.start_date)}
          </p>
        </div>
        <form action={deleteTrip.bind(null, trip.id)}>
          <button type="submit" aria-label="Delete trip" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
            <Trash2 size={16} />
          </button>
        </form>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Countdown" value={daysUntil > 0 ? `${daysUntil}d` : daysUntil === 0 ? "Today!" : "Underway"} />
        <StatCard label="Packed" value={`${packedCount} / ${(packing ?? []).length}`} />
      </div>

      {trip.savings_goal_amount > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Savings goal</h2>
          <Card className="mb-6 space-y-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-pink" style={{ width: `${savingsPct}%` }} />
            </div>
            <p className="text-sm text-charcoal-soft">
              {formatCurrency(trip.savings_current_amount)} of {formatCurrency(trip.savings_goal_amount)}
            </p>
            <SavingsProgressForm tripId={trip.id} />
          </Card>
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Packing list</h2>
      <div className="mb-6">
        <PackingList
          tripId={trip.id}
          items={(packing ?? []).map((p) => ({ id: p.id, name: p.name, category: p.category, packed: p.packed }))}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Itinerary</h2>
      <ItineraryList
        tripId={trip.id}
        items={(itinerary ?? []).map((i) => ({
          id: i.id,
          dateLabel: formatDate(i.item_date),
          timeLabel: i.item_time ? i.item_time.slice(0, 5) : null,
          title: i.title,
          notes: i.notes,
        }))}
      />
    </div>
  );
}
