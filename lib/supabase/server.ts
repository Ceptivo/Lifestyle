import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Server-only client using the service role key. There's no Supabase Auth
// session here — the PIN gate in proxy.ts is the app's only access control,
// so this bypasses RLS by design and must never be imported client-side.
export function createClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");

  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
