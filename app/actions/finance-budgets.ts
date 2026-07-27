"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addBudget(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const monthlyLimit = Math.round(Number(formData.get("monthlyLimit")) * 100) / 100;

  if (!categoryId || !monthlyLimit || monthlyLimit <= 0) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("finance_budgets")
    .insert({ category_id: categoryId, monthly_limit: monthlyLimit });

  if (error) {
    if (error.code === "23505") {
      throw new Error("This category already has a budget.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/finance", "layout");
}

export async function updateBudget(id: string, formData: FormData) {
  const monthlyLimit = Math.round(Number(formData.get("monthlyLimit")) * 100) / 100;
  if (!monthlyLimit || monthlyLimit <= 0) return;

  const supabase = createClient();
  const { error } = await supabase.from("finance_budgets").update({ monthly_limit: monthlyLimit }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

export async function deleteBudget(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("finance_budgets").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}
