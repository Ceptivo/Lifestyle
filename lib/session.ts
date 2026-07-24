import { createHmac, timingSafeEqual } from "crypto";

// Signed session cookie for the app's single PIN gate (no Supabase Auth
// involved — this just proves the proxy already saw a correct PIN).
export const COOKIE_NAME = "lifestyle_session";
const SESSION_DAYS = 90;

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionCookie(): { name: string; value: string; maxAge: number } {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(expires);
  return { name: COOKIE_NAME, value: `${payload}.${sign(payload)}`, maxAge: SESSION_DAYS * 24 * 60 * 60 };
}

export function isValidSessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return Number(payload) > Date.now();
}
