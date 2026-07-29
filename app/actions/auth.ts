"use server";

import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, createSessionCookie } from "@/lib/session";

export async function unlock(formData: FormData): Promise<{ error: boolean } | void> {
  const pin = String(formData.get("pin") ?? "").trim();
  const expected = process.env.APP_PIN;
  if (!expected) throw new Error("APP_PIN is not set");

  const matches = pin.length === expected.length && timingSafeEqual(Buffer.from(pin), Buffer.from(expected));
  if (!matches) {
    return { error: true };
  }

  const session = createSessionCookie();
  const cookieStore = await cookies();
  cookieStore.set(session.name, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });

  redirect("/");
}

export async function lock() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
