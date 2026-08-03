"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssignmentStatus } from "@/lib/types";

const ASSIGNMENT_STATUSES: AssignmentStatus[] = ["pending", "submitted", "graded"];

export async function addAssignment(formData: FormData) {
  const moduleId = String(formData.get("moduleId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const flagged = formData.get("flagged") === "on";

  if (!title || !dueDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("university_assignments").insert({
    module_id: moduleId || null,
    title,
    due_date: dueDate,
    notes: notes || null,
    flagged,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function updateAssignmentStatus(id: string, status: string) {
  if (!(ASSIGNMENT_STATUSES as string[]).includes(status)) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("university_assignments")
    .update({ status: status as AssignmentStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function toggleAssignmentFlag(id: string, flagged: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("university_assignments").update({ flagged }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}

export async function deleteAssignment(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("university_assignments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/university", "layout");
}
