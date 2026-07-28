"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// --- Maintenance -------------------------------------------------------

export async function addMaintenanceTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const nextDueDate = String(formData.get("nextDueDate") ?? "");
  const intervalDaysRaw = String(formData.get("intervalDays") ?? "");
  const intervalDays = intervalDaysRaw ? Number(intervalDaysRaw) : null;
  const icon = String(formData.get("icon") ?? "wrench");

  if (!title || !nextDueDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("home_maintenance_tasks").insert({
    title,
    notes: notes || null,
    interval_days: intervalDays,
    next_due_date: nextDueDate,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/environment", "layout");
}

export async function markMaintenanceDone(id: string) {
  const supabase = createClient();
  const { data: task, error: fetchError } = await supabase
    .from("home_maintenance_tasks")
    .select("next_due_date, interval_days")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  if (task.interval_days) {
    const { error } = await supabase
      .from("home_maintenance_tasks")
      .update({ next_due_date: addDays(task.next_due_date, task.interval_days) })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("home_maintenance_tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/environment", "layout");
}

export async function deleteMaintenanceTask(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("home_maintenance_tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/environment", "layout");
}

// --- Chores ------------------------------------------------------------------

export async function addChore(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const recurring = formData.get("recurring") === "on";
  const intervalDaysRaw = String(formData.get("intervalDays") ?? "");
  const intervalDays = recurring && intervalDaysRaw ? Number(intervalDaysRaw) : null;
  const icon = String(formData.get("icon") ?? "list-checks");

  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase.from("home_chores").insert({
    title,
    notes: notes || null,
    recurring,
    interval_days: intervalDays,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/environment", "layout");
}

export async function toggleChore(id: string) {
  const supabase = createClient();
  const { data: chore, error: fetchError } = await supabase
    .from("home_chores")
    .select("completed, recurring")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const today = new Date().toISOString().slice(0, 10);
  const nowCompleted = !chore.completed;

  const { error } = await supabase
    .from("home_chores")
    .update({
      // Recurring chores immediately reset so they reappear on the list.
      completed: chore.recurring ? false : nowCompleted,
      last_completed_date: nowCompleted ? today : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/environment", "layout");
}

export async function deleteChore(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("home_chores").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/environment", "layout");
}
