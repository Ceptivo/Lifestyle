import { createClient } from "@/lib/supabase/server";
import { RaceForm } from "@/components/health/RaceForm";
import { RaceList } from "@/components/health/RaceList";
import { BackLink } from "@/components/ui/BackLink";
import { todayLocalDate, formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function RacesPage() {
  const today = todayLocalDate();
  const supabase = createClient();
  const { data: races } = await supabase.from("health_races").select("*").order("event_date", { ascending: true });

  const raceRows = (races ?? []).map((r) => ({
    isUpcoming: r.event_date >= today,
    id: r.id,
    name: r.name,
    discipline: r.discipline,
    division: r.division,
    ageGroup: r.age_group,
    location: r.location,
    icon: r.icon,
    eventDateFormatted: formatDate(r.event_date),
    resultTime: r.result_time,
    resultNotes: r.result_notes,
  }));
  const upcomingRaces = raceRows.filter((r) => r.isUpcoming);
  const completedRaces = raceRows.filter((r) => !r.isUpcoming);

  return (
    <div>
      <BackLink href="/health" label="Back to Health" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Races</h1>

      <div className="mb-6">
        <RaceForm />
      </div>
      <RaceList upcoming={upcomingRaces} completed={completedRaces} />
    </div>
  );
}
