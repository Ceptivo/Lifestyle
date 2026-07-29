"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GoalStatus } from "@/lib/types";

const GOAL_STATUSES: GoalStatus[] = ["planned", "in_progress", "done"];

// --- Study material --------------------------------------------------------

export async function addMaterial(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!title || !subject) return;

  const supabase = createClient();
  const { error } = await supabase.from("university_study_materials").insert({
    title,
    subject,
    notes: notes || null,
    url: url || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function deleteMaterial(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("university_study_materials").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

// --- Exams -----------------------------------------------------------------

export async function addExam(formData: FormData) {
  const subject = String(formData.get("subject") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const examDate = String(formData.get("examDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!subject || !title || !examDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("university_exams").insert({
    subject,
    title,
    exam_date: examDate,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function deleteExam(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("university_exams").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

// --- Report card / grades ---------------------------------------------------

export async function addGrade(formData: FormData) {
  const subject = String(formData.get("subject") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  const assessment = String(formData.get("assessment") ?? "").trim();
  const mark = Number(formData.get("mark"));
  const maxMark = Number(formData.get("maxMark") ?? 100);

  if (!subject || !term || !assessment || !Number.isFinite(mark) || !Number.isFinite(maxMark) || maxMark <= 0) return;

  const supabase = createClient();
  const { error } = await supabase.from("university_grades").insert({
    subject,
    term,
    assessment,
    mark,
    max_mark: maxMark,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function deleteGrade(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("university_grades").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

// --- Goals -------------------------------------------------------------------

export async function addUniversityGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "");
  const icon = String(formData.get("icon") ?? "target");

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("university_goals").insert({
    name,
    description: description || null,
    target_date: targetDate || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function updateUniversityGoalStatus(id: string, status: string) {
  if (!(GOAL_STATUSES as string[]).includes(status)) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("university_goals")
    .update({ status: status as GoalStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function deleteUniversityGoal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("university_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}
