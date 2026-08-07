import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, StatCard } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { VehicleForm } from "@/components/vehicle/VehicleForm";
import { formatDate, todayLocalDate } from "@/lib/format";
import { daysBetween } from "@/lib/social";

export const revalidate = 60;

const CATEGORY_LABEL: Record<string, string> = { maintenance: "Maintenance", insurance: "Insurance", license: "License" };

export default async function VehicleOverviewPage() {
  const supabase = createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("*").order("created_at", { ascending: true }).limit(1);
  const vehicle = vehicles?.[0] ?? null;

  if (!vehicle) {
    return (
      <div>
        <p className="mb-4 text-center text-sm text-charcoal-soft">Add your vehicle to start tracking fuel, maintenance, insurance, and service history.</p>
        <VehicleForm />
      </div>
    );
  }

  const today = todayLocalDate();
  const [{ data: reminders }, { data: recentFuel }] = await Promise.all([
    supabase.from("vehicle_reminders").select("*").eq("vehicle_id", vehicle.id).order("next_due_date", { ascending: true }),
    supabase.from("vehicle_fuel_logs").select("cost").eq("vehicle_id", vehicle.id).order("log_date", { ascending: false }).limit(5),
  ]);

  const nextByCategory: Record<string, { title: string; dueDate: string } | undefined> = {};
  for (const r of reminders ?? []) {
    if (!nextByCategory[r.category]) nextByCategory[r.category] = { title: r.title, dueDate: r.next_due_date };
  }

  const recentFuelSpend = (recentFuel ?? []).reduce((sum, f) => sum + f.cost, 0);

  return (
    <div>
      <Card className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={vehicle.icon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-charcoal">{vehicle.name}</p>
          <p className="truncate text-sm text-charcoal-soft">
            {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "No make/model set"}
            {vehicle.license_plate && ` · ${vehicle.license_plate}`}
          </p>
        </div>
      </Card>

      <div className="mb-6">
        <VehicleForm vehicle={{ id: vehicle.id, name: vehicle.name, make: vehicle.make, model: vehicle.model, year: vehicle.year, licensePlate: vehicle.license_plate }} />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard
          label="Maintenance"
          value={nextByCategory.maintenance ? `${daysBetween(today, nextByCategory.maintenance.dueDate)}d` : "—"}
        />
        <StatCard label="Insurance" value={nextByCategory.insurance ? `${daysBetween(today, nextByCategory.insurance.dueDate)}d` : "—"} />
        <StatCard label="License" value={nextByCategory.license ? `${daysBetween(today, nextByCategory.license.dueDate)}d` : "—"} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Upcoming</h2>
      <Card className="mb-6 space-y-1">
        {(reminders ?? []).length === 0 && <p className="text-center text-sm text-charcoal-soft">No upcoming reminders — add one under Maintenance.</p>}
        {(reminders ?? []).slice(0, 5).map((r) => (
          <Link key={r.id} href="/vehicle/maintenance" className="flex items-center gap-3 rounded-xl py-1.5 hover:bg-cream">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={r.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-charcoal">{r.title}</p>
              <p className="truncate text-sm text-charcoal-soft">
                {CATEGORY_LABEL[r.category]} · Due {formatDate(r.next_due_date)}
              </p>
            </div>
          </Link>
        ))}
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Go to</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/vehicle/fuel">
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name="fuel" size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-charcoal">Fuel Log</p>
              <p className="truncate text-xs text-charcoal-soft">Last 5: R{recentFuelSpend.toFixed(0)}</p>
            </div>
          </Card>
        </Link>
        <Link href="/vehicle/service">
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name="wrench" size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-charcoal">Service History</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
