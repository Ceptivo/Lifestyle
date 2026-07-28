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
  const destinationAccountId = String(formData.get("destinationAccountId") ?? "") || null;
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
    destination_account_id: destinationAccountId,
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
  const destinationAccountId = String(formData.get("destinationAccountId") ?? "") || null;
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
      destination_account_id: destinationAccountId,
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
  subscription: Pick<
    Subscription,
    "id" | "account_id" | "category_id" | "destination_account_id" | "amount" | "name" | "cycle" | "next_due_date"
  >
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

  // A subscription with a destination account represents a transfer (e.g.
  // into savings/investments), not just a bill — post the offsetting income
  // leg so that account's balance actually grows.
  if (subscription.destination_account_id) {
    const { data: transferCategory, error: transferCategoryError } = await supabase
      .from("finance_categories")
      .select("id")
      .eq("type", "income")
      .eq("name", "Transfer")
      .maybeSingle();
    if (transferCategoryError) throw new Error(transferCategoryError.message);

    if (transferCategory) {
      const { error: transferInsertError } = await supabase.from("finance_transactions").insert({
        type: "income",
        account_id: subscription.destination_account_id,
        category_id: transferCategory.id,
        subscription_id: subscription.id,
        amount: subscription.amount,
        description: `Transfer: ${subscription.name}`,
        occurred_on: subscription.next_due_date,
      });
      if (transferInsertError) throw new Error(transferInsertError.message);
    }
  }

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
    .select("id, account_id, category_id, destination_account_id, amount, name, cycle, next_due_date")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  await postSubscriptionPayment(supabase, subscription);

  revalidatePath("/finance", "layout");
  revalidatePath("/");
}
