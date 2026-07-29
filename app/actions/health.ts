"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ICON } from "@/lib/icons";
import type { GoalStatus } from "@/lib/types";

const GOAL_STATUSES: GoalStatus[] = ["planned", "in_progress", "done"];

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// --- Training plan template --------------------------------------------
//
// A single reusable weekly template (one row per day_of_week 0-6) rather
// than a distinct plan per calendar week — editing a day updates the
// template for every week going forward.

export async function saveTrainingPlanDay(formData: FormData) {
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);

  if (Number.isNaN(dayOfWeek)) return;

  const supabase = createClient();

  if (!title) {
    const { error } = await supabase.from("health_training_plan").delete().eq("day_of_week", dayOfWeek);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("health_training_plan")
      .upsert(
        { day_of_week: dayOfWeek, title, description: description || null, icon, updated_at: new Date().toISOString() },
        { onConflict: "day_of_week" }
      );
    if (error) throw new Error(error.message);
  }

  revalidatePath("/health", "layout");
}

// --- Activities ----------------------------------------------------------

export async function addActivity(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const activityType = String(formData.get("activityType") ?? "Run").trim();
  const performedOn = String(formData.get("performedOn") ?? "");
  const durationMinutes = numberOrNull(formData.get("durationMinutes"));
  const distanceKm = numberOrNull(formData.get("distanceKm"));
  const calories = numberOrNull(formData.get("calories"));
  const notes = String(formData.get("notes") ?? "").trim();
  const icon = String(formData.get("icon") ?? "dumbbell");

  if (!title || !performedOn) return;

  const supabase = createClient();
  const { error } = await supabase.from("health_activities").insert({
    title,
    activity_type: activityType || "Run",
    performed_on: performedOn,
    duration_minutes: durationMinutes,
    distance_km: distanceKm,
    calories,
    notes: notes || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

export async function deleteActivity(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("health_activities").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

// --- Races -----------------------------------------------------------------

export async function addRace(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const discipline = String(formData.get("discipline") ?? "Hyrox").trim();
  const division = String(formData.get("division") ?? "").trim();
  const ageGroup = String(formData.get("ageGroup") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "");
  const icon = String(formData.get("icon") ?? "flag");

  if (!name || !eventDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("health_races").insert({
    name,
    discipline: discipline || "Hyrox",
    division: division || null,
    age_group: ageGroup || null,
    location: location || null,
    event_date: eventDate,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

export async function updateRaceResult(id: string, formData: FormData) {
  const resultTime = String(formData.get("resultTime") ?? "").trim();
  const resultNotes = String(formData.get("resultNotes") ?? "").trim();

  const supabase = createClient();
  const { error } = await supabase
    .from("health_races")
    .update({ result_time: resultTime || null, result_notes: resultNotes || null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

export async function deleteRace(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("health_races").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

// --- Sleep -----------------------------------------------------------------

export async function addSleepLog(formData: FormData) {
  const sleepDate = String(formData.get("sleepDate") ?? "");
  const bedtime = String(formData.get("bedtime") ?? "").trim();
  const wakeTime = String(formData.get("wakeTime") ?? "").trim();
  const durationHours = numberOrNull(formData.get("durationHours"));
  const qualityRating = numberOrNull(formData.get("qualityRating"));
  const moodNextDay = numberOrNull(formData.get("moodNextDay"));
  const energyNextDay = numberOrNull(formData.get("energyNextDay"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!sleepDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("health_sleep_logs").insert({
    sleep_date: sleepDate,
    bedtime: bedtime || null,
    wake_time: wakeTime || null,
    duration_hours: durationHours,
    quality_rating: qualityRating,
    mood_next_day: moodNextDay,
    energy_next_day: energyNextDay,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

export async function deleteSleepLog(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("health_sleep_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

// --- Journal ----------------------------------------------------------------

export async function addJournalEntry(formData: FormData) {
  const entryDate = String(formData.get("entryDate") ?? "");
  const symptom = String(formData.get("symptom") ?? "").trim();
  const severity = Number(formData.get("severity"));
  const bodyArea = String(formData.get("bodyArea") ?? "").trim();
  const triggers = String(formData.get("triggers") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const icon = String(formData.get("icon") ?? "pill");

  if (!entryDate || !symptom || !severity || severity < 1 || severity > 10) return;

  const supabase = createClient();
  const { error } = await supabase.from("health_journal_entries").insert({
    entry_date: entryDate,
    symptom,
    severity,
    body_area: bodyArea || null,
    triggers: triggers || null,
    notes: notes || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

export async function deleteJournalEntry(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("health_journal_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

// --- Goals -------------------------------------------------------------------

export async function addHealthGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "");
  const icon = String(formData.get("icon") ?? "target");

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("health_goals").insert({
    name,
    description: description || null,
    target_date: targetDate || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

export async function updateHealthGoalStatus(id: string, status: string) {
  if (!(GOAL_STATUSES as string[]).includes(status)) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("health_goals")
    .update({ status: status as GoalStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}

export async function deleteHealthGoal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("health_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/health", "layout");
}
