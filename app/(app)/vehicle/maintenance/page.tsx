import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VehicleReminderForm } from "@/components/vehicle/VehicleReminderForm";
import { VehicleReminderList, type VehicleReminder } from "@/components/vehicle/VehicleReminderList";
import { formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

export default async function VehicleMaintenancePage() {
  const supabase = createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("id").order("created_at", { ascending: true }).limit(1);
  const vehicle = vehicles?.[0] ?? null;

  if (!vehicle) {
    return (
      <p className="text-center text-sm text-charcoal-soft">
        <Link href="/vehicle" className="font-semibold text-pink-dark">
          Add your vehicle
        </Link>{" "}
        first to start tracking reminders.
      </p>
    );
  }

  const today = todayLocalDate();
  const { data: reminders } = await supabase
    .from("vehicle_reminders")
    .select("*")
    .eq("vehicle_id", vehicle.id)
    .order("next_due_date", { ascending: true });

  const rows: VehicleReminder[] = (reminders ?? []).map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    notes: r.notes,
    provider: r.provider,
    dueDateFormatted: formatDate(r.next_due_date),
    icon: r.icon,
    overdue: r.next_due_date < today,
  }));

  return (
    <div>
      <div className="mb-6">
        <VehicleReminderForm vehicleId={vehicle.id} />
      </div>
      <VehicleReminderList reminders={rows} />
    </div>
  );
}
