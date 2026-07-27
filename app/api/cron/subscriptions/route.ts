import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postSubscriptionPayment } from "@/app/actions/finance-subscriptions";

// Runs daily via Vercel Cron (see vercel.json). Posts a real transaction for
// every active subscription whose next_due_date has arrived, advancing the
// due date each time — catches up one cycle at a time if a run was ever
// missed, capped so a neglected subscription can't runaway-loop.
const MAX_CATCHUP_CYCLES = 24;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: due, error } = await supabase
    .from("finance_subscriptions")
    .select("id, account_id, category_id, amount, name, cycle, next_due_date")
    .eq("status", "active")
    .lte("next_due_date", today);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posted: { id: string; name: string; payments: number }[] = [];

  for (const subscription of due ?? []) {
    let current = subscription;
    let count = 0;
    while (current.next_due_date <= today && count < MAX_CATCHUP_CYCLES) {
      await postSubscriptionPayment(supabase, current);
      const { data: refreshed, error: refetchError } = await supabase
        .from("finance_subscriptions")
        .select("id, account_id, category_id, amount, name, cycle, next_due_date")
        .eq("id", current.id)
        .single();
      if (refetchError) throw new Error(refetchError.message);
      current = refreshed;
      count++;
    }
    if (count > 0) posted.push({ id: subscription.id, name: subscription.name, payments: count });
  }

  return NextResponse.json({ ok: true, today, posted });
}
