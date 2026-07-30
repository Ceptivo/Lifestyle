"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ICON } from "@/lib/icons";
import type { ReadingStatus } from "@/lib/types";

const STATUSES: ReadingStatus[] = ["want_to_read", "reading", "finished"];

// --- Reading list ------------------------------------------------------

export async function addBook(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "reading");
  const status = (STATUSES as string[]).includes(statusRaw) ? (statusRaw as ReadingStatus) : "reading";

  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase.from("learning_reading_list").insert({
    title,
    author: author || null,
    reason: reason || null,
    status,
    started_date: status !== "want_to_read" ? new Date().toISOString().slice(0, 10) : null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function updateBookProgress(id: string, formData: FormData) {
  const progressPct = Math.min(100, Math.max(0, Number(formData.get("progressPct") ?? 0)));
  const statusRaw = String(formData.get("status") ?? "reading");
  const status = (STATUSES as string[]).includes(statusRaw) ? (statusRaw as ReadingStatus) : "reading";

  const supabase = createClient();
  const { error } = await supabase
    .from("learning_reading_list")
    .update({
      progress_pct: progressPct,
      status,
      finished_date: status === "finished" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function updateBookDetails(id: string, formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const keyTakeaways = String(formData.get("keyTakeaways") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "");
  const pagesRaw = String(formData.get("pages") ?? "");
  const progressPct = Math.min(100, Math.max(0, Number(formData.get("progressPct") ?? 0)));
  const statusRaw = String(formData.get("status") ?? "reading");
  const status = (STATUSES as string[]).includes(statusRaw) ? (statusRaw as ReadingStatus) : "reading";

  const rating = ratingRaw ? Math.min(5, Math.max(1, Math.round(Number(ratingRaw)))) : null;
  const pages = pagesRaw ? Math.max(0, Math.round(Number(pagesRaw))) : null;

  const supabase = createClient();
  const { error } = await supabase
    .from("learning_reading_list")
    .update({
      description: description || null,
      key_takeaways: keyTakeaways || null,
      rating,
      pages,
      progress_pct: progressPct,
      status,
      finished_date: status === "finished" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function deleteBook(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("learning_reading_list").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

// --- Skills & practice sessions -------------------------------------------

export async function addSkill(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("learning_skills").insert({ name, icon });
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function deleteSkill(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("learning_skills").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function addSkillSession(skillId: string, formData: FormData) {
  const sessionDate = String(formData.get("sessionDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!skillId || !sessionDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("learning_skill_sessions").insert({
    skill_id: skillId,
    session_date: sessionDate,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function deleteSkillSession(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("learning_skill_sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

// --- Skills (courses/skill development, distinct from hobby practice) ------

export async function addCourse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("learning_courses").insert({ name, description: description || null, icon });
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function updateCourseProgress(id: string, formData: FormData) {
  const progressPct = Math.min(100, Math.max(0, Number(formData.get("progressPct") ?? 0)));
  const improvementNotes = String(formData.get("improvementNotes") ?? "").trim();

  const supabase = createClient();
  const { error } = await supabase
    .from("learning_courses")
    .update({ progress_pct: progressPct, improvement_notes: improvementNotes || null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}

export async function deleteCourse(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("learning_courses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/learning", "layout");
}
