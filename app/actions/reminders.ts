"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReminderPriority } from "@/lib/types";

const PRIORITIES: ReminderPriority[] = ["low", "medium", "urgent"];

function toPriority(value: FormDataEntryValue | null): ReminderPriority {
  const v = String(value ?? "").trim();
  return (PRIORITIES as string[]).includes(v) ? (v as ReminderPriority) : "medium";
}

export async function addReminder(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = toPriority(formData.get("priority"));
  const remindAt = String(formData.get("remindAt") ?? "").trim();
  const showOnHome = formData.get("showOnHome") === "on";
  const displayStart = String(formData.get("displayStart") ?? "").trim();
  const displayEnd = String(formData.get("displayEnd") ?? "").trim();

  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase.from("reminders").insert({
    title,
    description: description || null,
    priority,
    remind_at: remindAt || null,
    show_on_home: showOnHome,
    home_display_start: displayStart || null,
    home_display_end: displayEnd || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/reminders", "layout");
  revalidatePath("/", "layout");
}

export async function updateReminder(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = toPriority(formData.get("priority"));
  const remindAt = String(formData.get("remindAt") ?? "").trim();
  const displayStart = String(formData.get("displayStart") ?? "").trim();
  const displayEnd = String(formData.get("displayEnd") ?? "").trim();

  if (!title) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("reminders")
    .update({
      title,
      description: description || null,
      priority,
      remind_at: remindAt || null,
      home_display_start: displayStart || null,
      home_display_end: displayEnd || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/reminders", "layout");
  revalidatePath("/", "layout");
}

export async function toggleReminderHome(id: string, showOnHome: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("reminders").update({ show_on_home: showOnHome }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/reminders", "layout");
  revalidatePath("/", "layout");
}

export async function deleteReminder(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/reminders", "layout");
  revalidatePath("/", "layout");
}
