"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const NOTES_ID = "00000000-0000-0000-0000-000000000001";

export async function updateBudgetNotes(formData: FormData) {
  const content = String(formData.get("content") ?? "");

  const supabase = createClient();
  const { error } = await supabase
    .from("finance_budget_notes")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", NOTES_ID);

  if (error) throw new Error(error.message);

  revalidatePath("/finance/budgets");
}
