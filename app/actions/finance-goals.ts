"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ICON } from "@/lib/icons";

export async function addGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const targetAmount = Math.round(Number(formData.get("targetAmount")) * 100) / 100;
  const targetDateRaw = String(formData.get("targetDate") ?? "");

  if (!name || !targetAmount || targetAmount <= 0) return;

  const supabase = createClient();
  const { error } = await supabase.from("finance_goals").insert({
    name,
    icon,
    target_amount: targetAmount,
    target_date: targetDateRaw || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

export async function addGoalProgress(id: string, formData: FormData) {
  const amount = Math.round(Number(formData.get("amount")) * 100) / 100;
  if (!amount || amount <= 0) return;

  const supabase = createClient();
  const { data: goal, error: fetchError } = await supabase
    .from("finance_goals")
    .select("current_amount")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("finance_goals")
    .update({ current_amount: goal.current_amount + amount })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

export async function deleteGoal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("finance_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}
