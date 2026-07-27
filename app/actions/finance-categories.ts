"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { TRANSACTION_TYPES } from "@/lib/finance";
import { DEFAULT_ICON } from "@/lib/icons";
import type { FinanceType } from "@/lib/types";

export async function addCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const typeRaw = String(formData.get("type") ?? "expense");
  const type = (TRANSACTION_TYPES as string[]).includes(typeRaw) ? (typeRaw as FinanceType) : "expense";

  if (!name) return;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("finance_categories")
    .insert({ name, icon, type })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
  return data.id as string;
}

export async function updateCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("finance_categories").update({ name, icon }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("finance_categories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("This category still has transactions or a budget attached to it — remove those first.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/finance", "layout");
}
