"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ICON } from "@/lib/icons";

export async function addAccount(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const startingBalance = Math.round(Number(formData.get("startingBalance") ?? 0) * 100) / 100;

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("finance_accounts")
    .insert({ name, icon, starting_balance: startingBalance || 0 });

  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
  revalidatePath("/");
}

export async function updateAccount(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const startingBalance = Math.round(Number(formData.get("startingBalance") ?? 0) * 100) / 100;

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("finance_accounts")
    .update({ name, icon, starting_balance: startingBalance || 0 })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
  revalidatePath("/");
}

export async function deleteAccount(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("finance_accounts").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("This account still has transactions — remove or reassign those first.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/finance", "layout");
  revalidatePath("/");
}
