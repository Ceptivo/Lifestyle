"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALL_CATEGORIES, TRANSACTION_TYPES } from "@/lib/finance";
import type { FinanceCategory, FinanceType } from "@/lib/types";

export async function addTransaction(formData: FormData) {
  const typeRaw = String(formData.get("type") ?? "expense");
  const categoryRaw = String(formData.get("category") ?? "other");
  const amount = Math.round(Number(formData.get("amount")) * 100) / 100;
  const description = String(formData.get("description") ?? "").trim();
  const occurredOnRaw = String(formData.get("occurredOn") ?? "");

  const type = (TRANSACTION_TYPES as string[]).includes(typeRaw) ? (typeRaw as FinanceType) : "expense";
  const category = (ALL_CATEGORIES as string[]).includes(categoryRaw)
    ? (categoryRaw as FinanceCategory)
    : "other";

  if (!amount || amount <= 0) return;

  const supabase = createClient();
  const { error } = await supabase.from("finance_transactions").insert({
    type,
    category,
    amount,
    description: description || null,
    occurred_on: occurredOnRaw || undefined,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/finance");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance");
  revalidatePath("/");
}
