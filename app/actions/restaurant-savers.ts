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

export async function updateSpecial(id: string, formData: FormData) {
  const dayOfWeek = String(formData.get("dayOfWeek") ?? "");
  const restaurantName = String(formData.get("restaurantName") ?? "").trim();
  const itemName = String(formData.get("itemName") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!restaurantName || !itemName || !(DAYS as string[]).includes(dayOfWeek)) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("restaurant_specials")
    .update({
      day_of_week: dayOfWeek as DayOfWeek,
      restaurant_name: restaurantName,
      item_name: itemName,
      price: priceRaw ? Math.round(Number(priceRaw) * 100) / 100 : null,
      notes: notes || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/restaurant-savers");
}

export async function deleteSpecial(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("restaurant_specials").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/restaurant-savers");
}

// --- Lunch options -----------------------------------------------------

export async function addLunchOption(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const ratingRaw = String(formData.get("rating") ?? "");
  if (!name) return;

  const rating = ratingRaw ? Math.min(5, Math.max(1, Math.round(Number(ratingRaw)))) : null;

  const supabase = createClient();
  const { error } = await supabase.from("lunch_options").insert({
    name,
    notes: notes || null,
    category: category || null,
    price: priceRaw ? Math.round(Number(priceRaw) * 100) / 100 : null,
    rating,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/restaurant-savers");
}

export async function updateLunchOption(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const ratingRaw = String(formData.get("rating") ?? "");
  if (!name) return;

  const rating = ratingRaw ? Math.min(5, Math.max(1, Math.round(Number(ratingRaw)))) : null;

  const supabase = createClient();
  const { error } = await supabase
    .from("lunch_options")
    .update({
      name,
      notes: notes || null,
      category: category || null,
      price: priceRaw ? Math.round(Number(priceRaw) * 100) / 100 : null,
      rating,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/restaurant-savers");
}

export async function deleteLunchOption(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("lunch_options").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/restaurant-savers");
}
