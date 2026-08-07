import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/Card";
import { FuelLogForm } from "@/components/vehicle/FuelLogForm";
import { FuelLogList, type FuelLog } from "@/components/vehicle/FuelLogList";
import { formatDate, formatCurrency } from "@/lib/format";

export const revalidate = 60;

export default async function VehicleFuelPage() {
  const supabase = createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("id").order("created_at", { ascending: true }).limit(1);
  const vehicle = vehicles?.[0] ?? null;

  if (!vehicle) {
    return (
      <p className="text-center text-sm text-charcoal-soft">
        <Link href="/vehicle" className="font-semibold text-pink-dark">
          Add your vehicle
        </Link>{" "}
        first to start logging fuel.
      </p>
    );
  }

  const { data: fuelLogs } = await supabase
    .from("vehicle_fuel_logs")
    .select("*")
    .eq("vehicle_id", vehicle.id)
    .order("log_date", { ascending: false });

  const rows: FuelLog[] = (fuelLogs ?? []).map((f) => ({
    id: f.id,
    dateFormatted: formatDate(f.log_date),
    odometerKm: f.odometer_km,
    liters: f.liters,
    cost: f.cost,
    fuelStation: f.fuel_station,
  }));

  const totalSpend = rows.reduce((sum, r) => sum + r.cost, 0);
  const totalLiters = rows.reduce((sum, r) => sum + (r.liters ?? 0), 0);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard label="Total spent" value={formatCurrency(totalSpend)} />
        <StatCard label="Total liters" value={totalLiters ? `${totalLiters.toFixed(1)}L` : "—"} />
      </div>
      <div className="mb-6">
        <FuelLogForm vehicleId={vehicle.id} />
      </div>
      <FuelLogList logs={rows} />
    </div>
  );
}
