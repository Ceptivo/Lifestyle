"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/lib/types";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

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
