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

// --- Email updates ---------------------------------------------------------

export async function createEmailUpdate(formData: FormData) {
  const subject = String(formData.get("subject") ?? "").trim();
  const sourceName = String(formData.get("sourceName") ?? "").trim();
  const receivedDate = String(formData.get("receivedDate") ?? "").trim();
  const rawText = String(formData.get("rawText") ?? "");
  const itemsJson = String(formData.get("itemsJson") ?? "[]");

  let items: { text: string; contextPath: string | null }[] = [];
  try {
    const parsed = JSON.parse(itemsJson);
    if (Array.isArray(parsed)) {
      items = parsed
        .map((it) => ({
          text: String(it?.text ?? "").trim(),
          contextPath: it?.contextPath ? String(it.contextPath).trim() : null,
        }))
        .filter((it) => it.text.length > 0);
    }
  } catch {
    items = [];
  }

  if (!rawText.trim() || items.length === 0) return;

  const supabase = createClient();
  const { data: update, error } = await supabase
    .from("work_email_updates")
    .insert({
      subject: subject || null,
      source_name: sourceName || null,
      received_date: receivedDate || null,
      raw_text: rawText,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabase.from("work_update_items").insert(
    items.map((it, index) => ({
      update_id: update.id,
      context_path: it.contextPath,
      text: it.text,
      sort_order: index,
    }))
  );
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/work", "layout");
}

export async function markItemDone(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_update_items")
    .update({ status: "confirm_pending", status_changed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function flagItemUncertain(id: string, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim();

  const supabase = createClient();
  const { error } = await supabase
    .from("work_update_items")
    .update({ status: "uncertain", question_note: note || null, status_changed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function resolveUncertainItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_update_items")
    .update({ status: "confirm_pending", status_changed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function confirmItem(id: string) {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("work_update_items")
    .update({ status: "logged", status_changed_at: now, logged_at: now })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function deleteUpdateItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("work_update_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}

export async function deleteEmailUpdate(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("work_email_updates").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/work", "layout");
}
