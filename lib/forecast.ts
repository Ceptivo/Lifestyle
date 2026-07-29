import { projectOccurrencesInRange } from "@/lib/subscriptions";
import {
  currentFinancialMonthKey,
  financialMonthEndExclusive,
  financialMonthLabel,
  financialMonthRange,
  shiftFinancialMonthKey,
} from "@/lib/financial-month";
import type { FinanceType, SubscriptionCycle } from "@/lib/types";

type Account = { starting_balance: number };
type Transaction = { type: FinanceType; amount: number; occurred_on: string; subscription_id: string | null };
type Subscription = {
  id: string;
  name: string;
  amount: number;
  cycle: SubscriptionCycle;
  next_due_date: string;
  is_mandatory: boolean;
};

export type ForecastMonth = { label: string; balance: number; subscriptionTotal: number };
export type ForecastStep = { title: string; body: string };

export type Forecast = {
  currentBalance: number;
  avgMonthlyIncome: number;
  avgMonthlyNonSubExpense: number;
  projection: ForecastMonth[];
  firstNegative: ForecastMonth | undefined;
  monthlyNet: number;
  trendingUp: boolean;
  biggestCancellableSubscription: Subscription | null;
  steps: ForecastStep[];
};

function monthRange(offsetFromCurrent: number): { start: string; end: string; label: string } {
  const key = shiftFinancialMonthKey(currentFinancialMonthKey(), offsetFromCurrent);
  return {
    start: financialMonthRange(key).start,
    end: financialMonthEndExclusive(key),
    label: financialMonthLabel(key),
  };
}

function formatCurrencyShort(n: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);
}

function cycleUnit(cycle: SubscriptionCycle): string {
  return cycle === "yearly" ? "year" : cycle === "weekly" ? "week" : "month";
}

export function computeForecast(accounts: Account[], transactions: Transaction[], subscriptions: Subscription[]): Forecast {
  const baseline = monthRange(-3);
  const baselineEnd = monthRange(-1).end;

  let currentBalance = accounts.reduce((sum, a) => sum + a.starting_balance, 0);
  let baselineIncome = 0;
  let baselineExpense = 0;

  for (const tx of transactions) {
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
  const projection: ForecastMonth[] = months.map((m) => {
    const subscriptionTotal = subscriptions.reduce((sum, s) => {
      const occurrences = projectOccurrencesInRange(s.next_due_date, s.cycle, m.start, m.end);
      return sum + occurrences.length * s.amount;
    }, 0);
    running = running + avgMonthlyIncome - avgMonthlyNonSubExpense - subscriptionTotal;
    return { label: m.label, subscriptionTotal, balance: running };
  });

  const firstNegative = projection.find((p) => p.balance < 0);
  const avgSubscriptionTotal = projection.length
    ? projection.reduce((sum, p) => sum + p.subscriptionTotal, 0) / projection.length
    : 0;
  const monthlyNet = avgMonthlyIncome - avgMonthlyNonSubExpense - avgSubscriptionTotal;
  const trendingUp = monthlyNet >= 0;

  // Mandatory costs (tax, required insurance) are never a candidate for
  // "review/cancel this" advice — they still count in the totals above,
  // just not as a suggested cut.
  const cancellableSubs = subscriptions.filter((s) => !s.is_mandatory);
  const sortedCancellableSubs = [...cancellableSubs].sort((a, b) => b.amount - a.amount);
  const biggestCancellableSubscription = sortedCancellableSubs[0] ?? null;

  const steps: ForecastStep[] = [];
  if (firstNegative) {
    steps.push({
      title: `Close the ~${formatCurrencyShort(Math.abs(monthlyNet))}/month gap`,
      body: `You're spending about ${formatCurrencyShort(Math.abs(monthlyNet))} more than you bring in each month on average — that's what pushes the balance negative by ${firstNegative.label}. Closing this gap, through more income or less spend, is the single biggest lever you have.`,
    });
    if (biggestCancellableSubscription) {
      steps.push({
        title: `Review ${biggestCancellableSubscription.name}`,
        body: `Your largest reviewable recurring cost is ${biggestCancellableSubscription.name} at ${formatCurrencyShort(biggestCancellableSubscription.amount)}/${cycleUnit(biggestCancellableSubscription.cycle)}. Pausing, downgrading, or cancelling it goes a long way toward closing the gap.`,
      });
    }
    if (avgMonthlyNonSubExpense > 0) {
      steps.push({
        title: "Trim variable spending",
        body: `Non-subscription spending is averaging ${formatCurrencyShort(avgMonthlyNonSubExpense)}/month. Cutting even 10–15% (${formatCurrencyShort(avgMonthlyNonSubExpense * 0.125)}) meaningfully slows the decline.`,
      });
    }
    steps.push({
      title: "Build a buffer before it's due",
      body: `Move a lump sum into savings ahead of ${firstNegative.label} so the dip doesn't take the balance below zero when it lands.`,
    });
  } else {
    steps.push({
      title: "Stay the course",
      body: `At the current pace you're adding about ${formatCurrencyShort(monthlyNet)}/month, keeping the forecast on an upward trend. No changes needed — just keep it up.`,
    });
    if (monthlyNet > 0) {
      steps.push({
        title: "Put the surplus to work",
        body: `Consider directing some of that ${formatCurrencyShort(monthlyNet)}/month surplus into a savings Goal or an investment account so it keeps compounding instead of sitting idle.`,
      });
    }
    if (biggestCancellableSubscription) {
      steps.push({
        title: "Still worth a periodic review",
        body: `${biggestCancellableSubscription.name} is your biggest reviewable recurring cost at ${formatCurrencyShort(biggestCancellableSubscription.amount)}/${cycleUnit(biggestCancellableSubscription.cycle)} — worth checking every so often that you're still getting value from it.`,
      });
    }
  }

  return {
    currentBalance,
    avgMonthlyIncome,
    avgMonthlyNonSubExpense,
    projection,
    firstNegative,
    monthlyNet,
    trendingUp,
    biggestCancellableSubscription,
    steps,
  };
}
