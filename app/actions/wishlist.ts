"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CATEGORY_ICON: Record<string, string> = {
  car: "car",
  house: "home",
  personal: "user",
  training: "dumbbell",
};

function iconForCategory(category: string): string {
  return CATEGORY_ICON[category.trim().toLowerCase()] ?? "shopping-bag";
}

export async function addWishlistItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  if (!name || !category) return;

  const price = priceRaw ? Math.round(Number(priceRaw) * 100) / 100 : null;

  const supabase = createClient();
  const { error } = await supabase.from("wishlist_items").insert({
    name,
    category,
    price,
    icon: iconForCategory(category),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist", "layout");
}

export async function deleteWishlistItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist", "layout");
}

// Creates a Finance goal from this item and removes it from the buy-list,
// since it's now tracked as savings progress there instead.
export async function moveToFinanceGoal(id: string, formData: FormData) {
  const targetAmount = Math.round(Number(formData.get("targetAmount")) * 100) / 100;
  if (!targetAmount || targetAmount <= 0) return;

  const supabase = createClient();
  const { data: item, error: fetchError } = await supabase.from("wishlist_items").select("name, icon").eq("id", id).single();
  if (fetchError) throw new Error(fetchError.message);

  const { error: insertError } = await supabase.from("finance_goals").insert({
    name: item.name,
    icon: item.icon,
    target_amount: targetAmount,
  });
  if (insertError) throw new Error(insertError.message);

  const { error: deleteError } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (deleteError) throw new Error(deleteError.message);

  revalidatePath("/wishlist", "layout");
  revalidatePath("/finance", "layout");
}
