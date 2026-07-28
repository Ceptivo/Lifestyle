"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// --- Trips ---------------------------------------------------------------

export async function addTrip(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const savingsGoal = Math.round(Number(formData.get("savingsGoalAmount") ?? 0) * 100) / 100;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !startDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("travel_trips").insert({
    name,
    destination: destination || null,
    start_date: startDate,
    end_date: endDate || null,
    savings_goal_amount: savingsGoal,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

export async function deleteTrip(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("travel_trips").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

export async function addSavingsProgress(tripId: string, formData: FormData) {
  const amount = Math.round(Number(formData.get("amount")) * 100) / 100;
  if (!amount || amount <= 0) return;

  const supabase = createClient();
  const { data: trip, error: fetchError } = await supabase
    .from("travel_trips")
    .select("savings_current_amount")
    .eq("id", tripId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("travel_trips")
    .update({ savings_current_amount: trip.savings_current_amount + amount })
    .eq("id", tripId);
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

// --- Packing list --------------------------------------------------------

export async function addPackingItem(tripId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!tripId || !name) return;

  const supabase = createClient();
  const { error } = await supabase.from("travel_packing_items").insert({
    trip_id: tripId,
    name,
    category: category || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

export async function togglePackingItem(id: string) {
  const supabase = createClient();
  const { data: item, error: fetchError } = await supabase.from("travel_packing_items").select("packed").eq("id", id).single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase.from("travel_packing_items").update({ packed: !item.packed }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

export async function deletePackingItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("travel_packing_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

// --- Itinerary -------------------------------------------------------------

export async function addItineraryItem(tripId: string, formData: FormData) {
  const itemDate = String(formData.get("itemDate") ?? "");
  const itemTime = String(formData.get("itemTime") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!tripId || !itemDate || !title) return;

  const supabase = createClient();
  const { error } = await supabase.from("travel_itinerary_items").insert({
    trip_id: tripId,
    item_date: itemDate,
    item_time: itemTime || null,
    title,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

export async function deleteItineraryItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("travel_itinerary_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

// --- Bucket list -----------------------------------------------------------

export async function addBucketListItem(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "");
  const estimatedCostRaw = String(formData.get("estimatedCost") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase.from("travel_bucket_list").insert({
    title,
    target_date: targetDate || null,
    estimated_cost: estimatedCostRaw ? Math.round(Number(estimatedCostRaw) * 100) / 100 : null,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

export async function toggleBucketListAchieved(id: string) {
  const supabase = createClient();
  const { data: item, error: fetchError } = await supabase.from("travel_bucket_list").select("achieved").eq("id", id).single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase.from("travel_bucket_list").update({ achieved: !item.achieved }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}

export async function deleteBucketListItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("travel_bucket_list").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/travel", "layout");
}
