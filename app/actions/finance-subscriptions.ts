"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { advanceDueDate } from "@/lib/subscriptions";
import { DEFAULT_ICON } from "@/lib/icons";
import type { Database, SubscriptionCycle, SubscriptionStatus } from "@/lib/types";

const CYCLES: SubscriptionCycle[] = ["weekly", "monthly", "yearly"];

export async function addSubscription(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const amount = Math.round(Number(formData.get("amount")) * 100) / 100;
  const cycleRaw = String(formData.get("cycle") ?? "monthly");
  const cycle = (CYCLES as string[]).includes(cycleRaw) ? (cycleRaw as SubscriptionCycle) : "monthly";
  const accountId = String(formData.get("accountId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const nextDueDate = String(formData.get("nextDueDate") ?? "");

  if (!name || !amount || amount <= 0 || !accountId || !categoryId || !nextDueDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("finance_subscriptions").insert({
    name,
    icon,
    amount,
    cycle,
    account_id: accountId,
    category_id: categoryId,
    next_due_date: nextDueDate,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

export async function updateSubscription(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? DEFAULT_ICON);
  const amount = Math.round(Number(formData.get("amount")) * 100) / 100;
  const cycleRaw = String(formData.get("cycle") ?? "monthly");
  const cycle = (CYCLES as string[]).includes(cycleRaw) ? (cycleRaw as SubscriptionCycle) : "monthly";
  const accountId = String(formData.get("accountId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const nextDueDate = String(formData.get("nextDueDate") ?? "");

  if (!name || !amount || amount <= 0 || !accountId || !categoryId || !nextDueDate) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("finance_subscriptions")
    .update({
      name,
      icon,
      amount,
      cycle,
      account_id: accountId,
      category_id: categoryId,
      next_due_date: nextDueDate,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("finance_subscriptions").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

export async function deleteSubscription(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("finance_subscriptions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
}

type Subscription = Database["public"]["Tables"]["finance_subscriptions"]["Row"];

// Shared by the manual "Pay now" action and the daily cron route: inserts
// the real transaction the subscription represents and advances its next
// due date. Never called from the client directly.
export async function postSubscriptionPayment(
  supabase: SupabaseClient<Database>,
  subscription: Pick<Subscription, "id" | "account_id" | "category_id" | "amount" | "name" | "cycle" | "next_due_date">
) {
  const { error: insertError } = await supabase.from("finance_transactions").insert({
    type: "expense",
    account_id: subscription.account_id,
    category_id: subscription.category_id,
    subscription_id: subscription.id,
    amount: subscription.amount,
    description: subscription.name,
    occurred_on: subscription.next_due_date,
  });
  if (insertError) throw new Error(insertError.message);

  const nextDueDate = advanceDueDate(subscription.next_due_date, subscription.cycle);
  const { error: updateError } = await supabase
    .from("finance_subscriptions")
    .update({ next_due_date: nextDueDate })
    .eq("id", subscription.id);
  if (updateError) throw new Error(updateError.message);
}

export async function markSubscriptionPaid(id: string) {
  const supabase = createClient();
  const { data: subscription, error } = await supabase
    .from("finance_subscriptions")
    .select("id, account_id, category_id, amount, name, cycle, next_due_date")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  await postSubscriptionPayment(supabase, subscription);

  revalidatePath("/finance", "layout");
  revalidatePath("/");
}
