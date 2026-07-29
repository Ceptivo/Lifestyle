"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GoalStatus, TaskPriority } from "@/lib/types";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];
const GOAL_STATUSES: GoalStatus[] = ["planned", "in_progress", "done"];

// --- Tasks ---------------------------------------------------------------

export async function addTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const priorityRaw = String(formData.get("priority") ?? "medium");
  const priority = (PRIORITIES as string[]).includes(priorityRaw) ? (priorityRaw as TaskPriority) : "medium";

  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase.from("work_tasks").insert({
    title,
    notes: notes || null,
    due_date: dueDate || null,
    priority,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function toggleTask(id: string, done: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("work_tasks").update({ done: !done }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function deleteTask(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("work_tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

// --- Notes -----------------------------------------------------------------

export async function addNote(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase.from("work_notes").insert({ title, content });
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function updateNote(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase.from("work_notes").update({ title, content }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function deleteNote(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("work_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

// --- Goals -------------------------------------------------------------------

export async function addWorkGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "");
  const icon = String(formData.get("icon") ?? "target");

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("work_goals").insert({
    name,
    description: description || null,
    target_date: targetDate || null,
    icon,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function updateWorkGoalStatus(id: string, status: string) {
  if (!(GOAL_STATUSES as string[]).includes(status)) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("work_goals")
    .update({ status: status as GoalStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function deleteWorkGoal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("work_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}
