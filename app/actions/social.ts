"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ICON } from "@/lib/icons";
import type { GoalStatus } from "@/lib/types";

const GOAL_STATUSES: GoalStatus[] = ["planned", "in_progress", "done"];

// --- People ------------------------------------------------------------

export async function addPerson(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const relationshipType = String(formData.get("relationshipType") ?? "friend").trim();
  const icon = String(formData.get("icon") ?? "user");
  const targetCount = Number(formData.get("targetCount") ?? 2);
  const periodDays = Number(formData.get("periodDays") ?? 30);

  if (!name || !Number.isFinite(targetCount) || targetCount < 1 || !Number.isFinite(periodDays) || periodDays < 1) return;

  const supabase = createClient();
  const { error } = await supabase.from("social_people").insert({
    name,
    relationship_type: relationshipType || "friend",
    icon,
    interaction_target_count: targetCount,
    interaction_period_days: periodDays,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

export async function updatePersonTarget(id: string, formData: FormData) {
  const targetCount = Number(formData.get("targetCount"));
  const periodDays = Number(formData.get("periodDays"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!Number.isFinite(targetCount) || targetCount < 1 || !Number.isFinite(periodDays) || periodDays < 1) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("social_people")
    .update({ interaction_target_count: targetCount, interaction_period_days: periodDays, notes: notes || null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

export async function deletePerson(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("social_people").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

// --- Interactions --------------------------------------------------------

export async function addInteraction(personId: string, formData: FormData) {
  const occurredOn = String(formData.get("occurredOn") ?? "");
  const interactionType = String(formData.get("interactionType") ?? "Meetup").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!personId || !occurredOn) return;

  const supabase = createClient();
  const { error } = await supabase.from("social_interactions").insert({
    person_id: personId,
    occurred_on: occurredOn,
    interaction_type: interactionType || "Meetup",
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

export async function deleteInteraction(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("social_interactions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

// --- Shared goals ------------------------------------------------------------

export async function addSharedGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "");
  const personId = String(formData.get("personId") ?? "");
  const icon = String(formData.get("icon") ?? "target");

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("social_shared_goals").insert({
    name,
    description: description || null,
    target_date: targetDate || null,
    person_id: personId || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

export async function updateSharedGoalStatus(id: string, status: string) {
  if (!(GOAL_STATUSES as string[]).includes(status)) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("social_shared_goals")
    .update({ status: status as GoalStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

export async function deleteSharedGoal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("social_shared_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

// --- Occasions -----------------------------------------------------------------

export async function addOccasion(formData: FormData) {
  const personId = String(formData.get("personId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const occasionDate = String(formData.get("occasionDate") ?? "");
  const recurring = formData.get("recurring") === "on";
  const giftIdeas = String(formData.get("giftIdeas") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);

  if (!personId || !label || !occasionDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("social_occasions").insert({
    person_id: personId,
    label,
    occasion_date: occasionDate,
    recurring,
    gift_ideas: giftIdeas || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}

export async function deleteOccasion(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("social_occasions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/social", "layout");
}
