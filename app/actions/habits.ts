"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addHabit(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "target");

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("habits").insert({ name, icon });
  if (error) throw new Error(error.message);

  revalidatePath("/habits", "layout");
}

export async function deleteHabit(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/habits", "layout");
}

export async function toggleHabitLog(habitId: string, logDate: string, checked: boolean) {
  const supabase = createClient();

  if (checked) {
    const { error } = await supabase.from("habit_logs").upsert({ habit_id: habitId, log_date: logDate }, { onConflict: "habit_id,log_date" });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("log_date", logDate);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/habits", "layout");
}
