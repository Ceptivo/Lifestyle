"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { VehicleReminderCategory } from "@/lib/types";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// --- Vehicle -------------------------------------------------------------

export async function addVehicle(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const licensePlate = String(formData.get("licensePlate") ?? "").trim();
  const icon = String(formData.get("icon") ?? "car");

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("vehicles").insert({
    name,
    make: make || null,
    model: model || null,
    year: yearRaw ? Number(yearRaw) : null,
    license_plate: licensePlate || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

export async function updateVehicle(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const licensePlate = String(formData.get("licensePlate") ?? "").trim();

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({
      name,
      make: make || null,
      model: model || null,
      year: yearRaw ? Number(yearRaw) : null,
      license_plate: licensePlate || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

export async function deleteVehicle(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

// --- Reminders (maintenance / insurance / license) ------------------------

export async function addVehicleReminder(formData: FormData) {
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const category = String(formData.get("category") ?? "maintenance") as VehicleReminderCategory;
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim();
  const nextDueDate = String(formData.get("nextDueDate") ?? "");
  const intervalDaysRaw = String(formData.get("intervalDays") ?? "");
  const icon = String(formData.get("icon") ?? "wrench");

  if (!vehicleId || !title || !nextDueDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("vehicle_reminders").insert({
    vehicle_id: vehicleId,
    category,
    title,
    notes: notes || null,
    provider: provider || null,
    next_due_date: nextDueDate,
    interval_days: intervalDaysRaw ? Number(intervalDaysRaw) : null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

export async function markVehicleReminderDone(id: string) {
  const supabase = createClient();
  const { data: reminder, error: fetchError } = await supabase
    .from("vehicle_reminders")
    .select("next_due_date, interval_days")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  if (reminder.interval_days) {
    const { error } = await supabase
      .from("vehicle_reminders")
      .update({ next_due_date: addDays(reminder.next_due_date, reminder.interval_days) })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("vehicle_reminders").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/vehicle", "layout");
}

export async function deleteVehicleReminder(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("vehicle_reminders").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

// --- Fuel log --------------------------------------------------------------

export async function addFuelLog(formData: FormData) {
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const logDate = String(formData.get("logDate") ?? "");
  const odometerRaw = String(formData.get("odometerKm") ?? "").trim();
  const litersRaw = String(formData.get("liters") ?? "").trim();
  const costRaw = String(formData.get("cost") ?? "").trim();
  const fuelStation = String(formData.get("fuelStation") ?? "").trim();

  if (!vehicleId || !logDate || !costRaw) return;

  const supabase = createClient();
  const { error } = await supabase.from("vehicle_fuel_logs").insert({
    vehicle_id: vehicleId,
    log_date: logDate,
    odometer_km: odometerRaw ? Number(odometerRaw) : null,
    liters: litersRaw ? Number(litersRaw) : null,
    cost: Number(costRaw),
    fuel_station: fuelStation || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

export async function deleteFuelLog(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("vehicle_fuel_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

// --- Service history ---------------------------------------------------------

export async function addServiceLog(formData: FormData) {
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const serviceDate = String(formData.get("serviceDate") ?? "");
  const odometerRaw = String(formData.get("odometerKm") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const costRaw = String(formData.get("cost") ?? "").trim();
  const workshop = String(formData.get("workshop") ?? "").trim();

  if (!vehicleId || !serviceDate || !description) return;

  const supabase = createClient();
  const { error } = await supabase.from("vehicle_service_logs").insert({
    vehicle_id: vehicleId,
    service_date: serviceDate,
    odometer_km: odometerRaw ? Number(odometerRaw) : null,
    description,
    cost: costRaw ? Number(costRaw) : null,
    workshop: workshop || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}

export async function deleteServiceLog(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("vehicle_service_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vehicle", "layout");
}
