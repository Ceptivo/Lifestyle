import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ServiceLogForm } from "@/components/vehicle/ServiceLogForm";
import { ServiceLogList, type ServiceLog } from "@/components/vehicle/ServiceLogList";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function VehicleServicePage() {
  const supabase = createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("id").order("created_at", { ascending: true }).limit(1);
  const vehicle = vehicles?.[0] ?? null;

  if (!vehicle) {
    return (
      <p className="text-center text-sm text-charcoal-soft">
        <Link href="/vehicle" className="font-semibold text-pink-dark">
          Add your vehicle
        </Link>{" "}
        first to start logging service history.
      </p>
    );
  }

  const { data: serviceLogs } = await supabase
    .from("vehicle_service_logs")
    .select("*")
    .eq("vehicle_id", vehicle.id)
    .order("service_date", { ascending: false });

  const rows: ServiceLog[] = (serviceLogs ?? []).map((s) => ({
    id: s.id,
    dateFormatted: formatDate(s.service_date),
    odometerKm: s.odometer_km,
    description: s.description,
    cost: s.cost,
    workshop: s.workshop,
  }));

  return (
    <div>
      <div className="mb-6">
        <ServiceLogForm vehicleId={vehicle.id} />
      </div>
      <ServiceLogList logs={rows} />
    </div>
  );
}
