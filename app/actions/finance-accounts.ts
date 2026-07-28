"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ICON } from "@/lib/icons";

export async function addAccount(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const balance = Math.round(Number(formData.get("balance") ?? 0) * 100) / 100;

  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("finance_accounts")
    .insert({ name, icon, starting_balance: balance || 0 });

  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
  revalidatePath("/");
}

// The "balance" field here is the account's *current* balance the user
// wants to see, not the opening balance — whatever they type is what shows
// up. Since balance = starting_balance + sum(transactions), this works
// backwards to the starting_balance that makes that true, leaving
// transaction history untouched.
export async function updateAccount(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const targetBalance = Math.round(Number(formData.get("balance") ?? 0) * 100) / 100;

  if (!name) return;

  const supabase = createClient();
  const { data: account, error: accountError } = await supabase
    .from("finance_accounts")
    .select("starting_balance")
    .eq("id", id)
    .single();
  if (accountError) throw new Error(accountError.message);

  const { data: transactions, error: txError } = await supabase
    .from("finance_transactions")
    .select("type, amount")
    .eq("account_id", id);
  if (txError) throw new Error(txError.message);

  const txNet = (transactions ?? []).reduce((sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount), 0);
  const currentBalance = account.starting_balance + txNet;
  const newStartingBalance = Math.round((account.starting_balance + (targetBalance - currentBalance)) * 100) / 100;

  const { error } = await supabase
    .from("finance_accounts")
    .update({ name, icon, starting_balance: newStartingBalance })
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
