import { AlertTriangle, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/Card";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { computeForecast } from "@/lib/forecast";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import { cn } from "@/lib/cn";

export const revalidate = 60;

export default async function ForecastPage() {
  const supabase = createClient();

  const [{ data: accounts }, { data: transactions }, { data: subscriptions }] = await Promise.all([
    supabase.from("finance_accounts").select("starting_balance"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, subscription_id"),
    supabase
      .from("finance_subscriptions")
      .select("id, name, amount, cycle, next_due_date, is_mandatory")
      .eq("status", "active"),
  ]);

  const forecast = computeForecast(accounts ?? [], transactions ?? [], subscriptions ?? []);
  const { currentBalance, avgMonthlyIncome, avgMonthlyNonSubExpense, projection, firstNegative, steps } = forecast;

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
      <Card className="mb-6 space-y-3">
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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        {firstNegative ? "How to avoid going negative" : "Keep the forecast climbing"}
      </h2>
      <ul className="space-y-2">
        {steps.map((step, i) => (
          <li key={step.title}>
            <Card className="flex gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  firstNegative ? "bg-danger-soft text-danger" : "bg-pink-soft text-pink-dark"
                )}
              >
                {i === 0 && !firstNegative ? <TrendingUp size={16} /> : i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal">{step.title}</p>
                <p className="mt-0.5 text-sm text-charcoal-soft">{step.body}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
