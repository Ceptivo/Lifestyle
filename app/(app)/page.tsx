import Link from "next/link";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/ui/PageHeading";
import { Card } from "@/components/ui/Card";
import { formatCurrency, todayLocalDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const { data: transactions } = await supabase.from("finance_transactions").select("type, amount, occurred_on");

  const monthPrefix = todayLocalDate().slice(0, 7);
  let balance = 0;
  let monthExpense = 0;

  for (const tx of transactions ?? []) {
    balance += tx.type === "income" ? tx.amount : -tx.amount;
    if (tx.type === "expense" && tx.occurred_on.startsWith(monthPrefix)) {
      monthExpense += tx.amount;
    }
  }

  return (
    <div>
      <PageHeading title="Home" subtitle="Your spaces, all in one place." />

      <Link href="/finance">
        <Card className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Wallet size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-charcoal">Finance</p>
              <p className="truncate text-xs text-charcoal-soft">{formatCurrency(monthExpense)} spent this month</p>
            </div>
          </div>
          <p className="shrink-0 text-lg font-bold tabular-nums text-charcoal">{formatCurrency(balance)}</p>
        </Card>
      </Link>
    </div>
  );
}
