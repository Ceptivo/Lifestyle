"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addActivity(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const costEstimateRaw = String(formData.get("costEstimate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("activities_todo").insert({
    name,
    location: location || null,
    cost_estimate: costEstimateRaw ? Math.round(Number(costEstimateRaw) * 100) / 100 : null,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/activities");
}

export async function toggleActivityDone(id: string) {
  const supabase = createClient();
  const { data: item, error: fetchError } = await supabase.from("activities_todo").select("done").eq("id", id).single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase.from("activities_todo").update({ done: !item.done }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/activities");
}

export async function deleteActivity(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("activities_todo").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/activities");
}
