"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addShoppingListItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = createClient();
  const { error } = await supabase.from("shopping_list_items").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist", "layout");
}

export async function toggleShoppingListItem(id: string, checked: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("shopping_list_items").update({ checked }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist", "layout");
}

export async function deleteShoppingListItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("shopping_list_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist", "layout");
}

export async function clearCheckedShoppingItems() {
  const supabase = createClient();
  const { error } = await supabase.from("shopping_list_items").delete().eq("checked", true);
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist", "layout");
}
