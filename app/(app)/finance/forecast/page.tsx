import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { projectOccurrencesInRange } from "@/lib/subscriptions";
import { formatCurrency, formatCurrencyCompact, todayLocalDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export const revalidate = 60;

function monthRange(offsetFromCurrent: number): { start: string; end: string; label: string } {
  const today = new Date(todayLocalDate() + "T00:00:00");
  const start = new Date(today.getFullYear(), today.getMonth() + offsetFromCurrent, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + offsetFromCurrent + 1, 1);
  const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    start: toISO(start),
    end: toISO(end),
    label: start.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  };
}

export default async function ForecastPage() {
  const supabase = createClient();

  const baseline = monthRange(-3);
  const baselineEnd = monthRange(-1).end; // start of current month

  const [{ data: accounts }, { data: allTransactions }, { data: subscriptions }] = await Promise.all([
    supabase.from("finance_accounts").select("starting_balance"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, subscription_id"),
    supabase
      .from("finance_subscriptions")
      .select("id, name, amount, cycle, next_due_date")
      .eq("status", "active"),
  ]);

  let currentBalance = (accounts ?? []).reduce((sum, a) => sum + a.starting_balance, 0);
  let baselineIncome = 0;
  let baselineExpense = 0;

  for (const tx of allTransactions ?? []) {
    currentBalance += tx.type === "income" ? tx.amount : -tx.amount;

    if (tx.occurred_on >= baseline.start && tx.occurred_on < baselineEnd) {
      if (tx.type === "income") baselineIncome += tx.amount;
      else if (!tx.subscription_id) baselineExpense += tx.amount;
    }
  }

  const avgMonthlyIncome = baselineIncome / 3;
  const avgMonthlyNonSubExpense = baselineExpense / 3;

  const months = Array.from({ length: 6 }, (_, i) => monthRange(i + 1));
  let running = currentBalance;
  const projection = months.map((m) => {
    const subscriptionTotal = (subscriptions ?? []).reduce((sum, s) => {
      const occurrences = projectOccurrencesInRange(s.next_due_date, s.cycle, m.start, m.end);
      return sum + occurrences.length * s.amount;
    }, 0);

    running = running + avgMonthlyIncome - avgMonthlyNonSubExpense - subscriptionTotal;

    return { label: m.label, subscriptionTotal, balance: running };
  });

  const firstNegative = projection.find((p) => p.balance < 0);

  return (
    <div>
      <FinanceBackLink />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Forecast</h1>

      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard label="Balance today" value={formatCurrencyCompact(currentBalance)} />
        <StatCard label="Avg. monthly in" value={formatCurrencyCompact(avgMonthlyIncome)} />
        <StatCard label="Avg. monthly out" value={formatCurrencyCompact(avgMonthlyNonSubExpense)} />
      </div>

      <p className="mb-6 text-xs text-charcoal-soft">
        Based on your average income and non-subscription spending over the last 3 months, plus known upcoming
        subscription payments.
      </p>

      {firstNegative && (
        <Card tone="danger-soft" className="mb-6 flex items-center gap-3 px-4 py-3.5">
          <AlertTriangle size={18} className="shrink-0 text-danger" />
          <p className="text-sm text-danger">
            Projected to go negative by <span className="font-semibold">{firstNegative.label}</span>.
          </p>
        </Card>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">6-month projection</h2>
      <Card className="space-y-3">
        {projection.map((p) => (
          <div key={p.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal">{p.label}</p>
              {p.subscriptionTotal > 0 && (
                <p className="text-xs text-charcoal-soft">
                  incl. {formatCurrency(p.subscriptionTotal)} in subscriptions
                </p>
              )}
            </div>
            <p className={cn("text-base font-bold tabular-nums", p.balance < 0 ? "text-danger" : "text-charcoal")}>
              {formatCurrency(p.balance)}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
