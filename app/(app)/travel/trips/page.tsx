import { createClient } from "@/lib/supabase/server";
import { TripForm } from "@/components/travel/TripForm";
import { TripCard, type TripCardData } from "@/components/travel/TripCard";
import { formatCurrency, formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export default async function TripsPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const { data: trips } = await supabase.from("travel_trips").select("*").order("start_date", { ascending: true });

  const rows: TripCardData[] = (trips ?? []).map((t) => {
    const daysUntil = daysBetween(today, t.start_date);
    const savingsPct = t.savings_goal_amount > 0 ? Math.min(100, (t.savings_current_amount / t.savings_goal_amount) * 100) : 0;
    return {
      id: t.id,
      name: t.name,
      destination: t.destination,
      icon: t.icon,
      dateRangeLabel: t.end_date ? `${formatDate(t.start_date)} – ${formatDate(t.end_date)}` : formatDate(t.start_date),
      countdownLabel: daysUntil > 0 ? `In ${daysUntil}d` : daysUntil === 0 ? "Today!" : "In progress / past",
      savingsPct,
      savingsLabel:
        t.savings_goal_amount > 0
          ? `${formatCurrency(t.savings_current_amount)} of ${formatCurrency(t.savings_goal_amount)} saved`
          : "",
    };
  });

  return (
    <div>
      <div className="mb-6">
        <TripForm />
      </div>
      {rows.length === 0 ? (
        <p className="text-center text-sm text-charcoal-soft">No trips planned yet.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
