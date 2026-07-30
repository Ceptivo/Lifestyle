"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLocationType, ActivityPhysicalType, ActivityCostTier } from "@/lib/types";

const LOCATION_TYPES: ActivityLocationType[] = ["indoor", "outdoor"];
const PHYSICAL_TYPES: ActivityPhysicalType[] = ["physical", "non_physical"];
const COST_TIERS: ActivityCostTier[] = ["cheap", "expensive"];

export async function addActivity(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const costEstimateRaw = String(formData.get("costEstimate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const locationTypeRaw = String(formData.get("locationType") ?? "outdoor");
  const physicalTypeRaw = String(formData.get("physicalType") ?? "physical");
  const costTierRaw = String(formData.get("costTier") ?? "cheap");
  if (!name) return;

  const locationType = (LOCATION_TYPES as string[]).includes(locationTypeRaw) ? (locationTypeRaw as ActivityLocationType) : "outdoor";
  const physicalType = (PHYSICAL_TYPES as string[]).includes(physicalTypeRaw) ? (physicalTypeRaw as ActivityPhysicalType) : "physical";
  const costTier = (COST_TIERS as string[]).includes(costTierRaw) ? (costTierRaw as ActivityCostTier) : "cheap";

  const supabase = createClient();
  const { error } = await supabase.from("activities_todo").insert({
    name,
    location: location || null,
    cost_estimate: costEstimateRaw ? Math.round(Number(costEstimateRaw) * 100) / 100 : null,
    notes: notes || null,
    location_type: locationType,
    physical_type: physicalType,
    cost_tier: costTier,
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
