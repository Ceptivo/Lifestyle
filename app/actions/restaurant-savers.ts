"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DayOfWeek } from "@/lib/types";

const DAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export async function addSpecial(formData: FormData) {
  const dayOfWeek = String(formData.get("dayOfWeek") ?? "");
  const restaurantName = String(formData.get("restaurantName") ?? "").trim();
  const itemName = String(formData.get("itemName") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!restaurantName || !itemName || !(DAYS as string[]).includes(dayOfWeek)) return;

  const supabase = createClient();
  const { error } = await supabase.from("restaurant_specials").insert({
    day_of_week: dayOfWeek as DayOfWeek,
    restaurant_name: restaurantName,
    item_name: itemName,
    price: priceRaw ? Math.round(Number(priceRaw) * 100) / 100 : null,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/restaurant-savers");
}

export async function deleteSpecial(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("restaurant_specials").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/restaurant-savers");
}
