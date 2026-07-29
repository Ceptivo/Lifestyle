"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addImprovementNote(formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const supabase = createClient();
  const { error } = await supabase.from("profile_improvement_notes").insert({ content });
  if (error) throw new Error(error.message);

  revalidatePath("/profile", "layout");
}

export async function deleteImprovementNote(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("profile_improvement_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile", "layout");
}
