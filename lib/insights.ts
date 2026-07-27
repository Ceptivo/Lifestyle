// A rules-based financial advisor: every threshold here is grounded in a
// widely-cited personal-finance guideline rather than an arbitrary number.
//
//   - 20% savings rate + 50/30/20 needs/wants/savings split
//     (the standard "50/30/20 rule" popularized by Elizabeth Warren)
//   - 3–6 months of essential expenses as an emergency-fund target for a
//     stable single income (9–12 months if income is variable)
//   - The "28/36 rule": housing costs at or below 28% of gross income,
//     total debt obligations at or below 36%
//
// These are starting points, not laws — the copy says "guideline," never
// "you must." Insights degrade gracefully with thin transaction history
// instead of asserting confident advice off one or two data points.

export type InsightStatus = "good" | "warning" | "tip";

export type Insight = {
  id: string;
  status: InsightStatus;
  icon: string;
  title: string;
  body: string;
};

export type InsightInput = {
  netWorth: number;
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  monthsOfHistory: number;
  categorySpend: { categoryId: string; name: string; amount: number; avgAmount: number }[];
  monthlySubscriptionCommitment: number;
  budgets: { categoryName: string; limit: number; spent: number }[];
  goals: { name: string; currentAmount: number; targetAmount: number; targetDate: string | null }[];
  today: string;
};

function monthsBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + (to.getDate() - from.getDate()) / 30;
}

export function generateInsights(input: InsightInput): Insight[] {
  const {
    netWorth,
    avgMonthlyIncome,
    avgMonthlyExpense,
    monthsOfHistory,
    categorySpend,
    monthlySubscriptionCommitment,
    budgets,
    goals,
    today,
  } = input;

  const insights: Insight[] = [];
  const thinHistory = monthsOfHistory < 1;

  // --- Savings rate vs. the 50/30/20 rule's 20% target ---------------------
  if (avgMonthlyIncome > 0) {
    const savingsRate = ((avgMonthlyIncome - avgMonthlyExpense) / avgMonthlyIncome) * 100;
    if (savingsRate >= 20) {
      insights.push({
        id: "savings-rate",
        status: "good",
        icon: "piggy-bank",
        title: `Saving ~${savingsRate.toFixed(0)}% of income`,
        body: `You're saving about ${savingsRate.toFixed(0)}% of what comes in — at or above the 20% target from the classic 50/30/20 rule (50% needs, 30% wants, 20% savings/debt paydown). Keep automating it into your Goals so it stays a habit and not a decision.`,
      });
    } else if (savingsRate >= 10) {
      insights.push({
        id: "savings-rate",
        status: "tip",
        icon: "piggy-bank",
        title: `Saving ~${savingsRate.toFixed(0)}% of income — below the 20% benchmark`,
        body: `You're keeping about ${savingsRate.toFixed(0)}% of income each month. The widely-used 50/30/20 rule targets 20% toward savings and debt paydown. Closing even a third of that gap — trimming "wants" spending or moving a fixed amount to a Goal on payday — compounds fast.`,
      });
    } else if (savingsRate >= 0) {
      insights.push({
        id: "savings-rate",
        status: "warning",
        icon: "piggy-bank",
        title: `Savings rate is thin — ~${savingsRate.toFixed(0)}%`,
        body: `Only about ${savingsRate.toFixed(0)}% of income is being kept each month, well under the 20% guideline. Before optimizing anything else, look for one or two "wants" categories to cut — the biggest ones below are the highest-leverage place to start.`,
      });
    } else {
      insights.push({
        id: "savings-rate",
        status: "warning",
        icon: "piggy-bank",
        title: "Spending more than you bring in",
        body: `Expenses have outpaced income by about ${formatPct(Math.abs(((avgMonthlyIncome - avgMonthlyExpense) / avgMonthlyIncome) * 100))}% on average. This is the single highest-priority fix — even partial progress toward breakeven protects the emergency fund below from draining.`,
      });
    }
  }

  // --- Emergency fund: 3–6 months of expenses ------------------------------
  if (avgMonthlyExpense > 0) {
    const runwayMonths = netWorth / avgMonthlyExpense;
    if (netWorth < 0) {
      insights.push({
        id: "emergency-fund",
        status: "warning",
        icon: "shield",
        title: "Net worth is negative",
        body: `Total balance across accounts is below zero. Before building an emergency fund, the priority is getting back to R0 — even small, consistent deposits change the trajectory.`,
      });
    } else if (runwayMonths >= 6) {
      insights.push({
        id: "emergency-fund",
        status: "good",
        icon: "shield",
        title: `${runwayMonths.toFixed(1)} months of expenses covered`,
        body: `Your balance covers roughly ${runwayMonths.toFixed(1)} months of average spending — at or beyond the standard 3–6 month emergency-fund guideline for a stable income. Once you're comfortably past 6, extra cash is usually better working in a Goal earning interest than sitting idle.`,
      });
    } else if (runwayMonths >= 3) {
      insights.push({
        id: "emergency-fund",
        status: "tip",
        icon: "shield",
        title: `${runwayMonths.toFixed(1)} months of expenses covered`,
        body: `You're within the commonly recommended 3–6 month emergency-fund range. If your income is variable rather than fixed, advisors typically suggest stretching toward 9–12 months instead — worth factoring in.`,
      });
    } else if (!thinHistory) {
      insights.push({
        id: "emergency-fund",
        status: "warning",
        icon: "shield",
        title: `Only ${runwayMonths.toFixed(1)} months of expenses covered`,
        body: `A common guideline is 3–6 months of essential expenses in reserve before anything else. At the current pace you're at about ${runwayMonths.toFixed(1)} — a dedicated "Emergency fund" Goal with a fixed monthly transfer is the fastest way to close that gap.`,
      });
    }
  }

  // --- Category concentration (28% housing rule + general concentration) --
  const totalMonthSpend = categorySpend.reduce((sum, c) => sum + c.amount, 0);
  const housing = categorySpend.find((c) => c.name.toLowerCase() === "housing");
  if (housing && avgMonthlyIncome > 0) {
    const housingRatio = (housing.amount / avgMonthlyIncome) * 100;
    if (housingRatio > 28) {
      insights.push({
        id: "housing-ratio",
        status: "warning",
        icon: "home",
        title: `Housing is ~${housingRatio.toFixed(0)}% of income`,
        body: `Housing costs are running about ${housingRatio.toFixed(0)}% of income — above the classic 28% affordability guideline (part of the "28/36 rule" lenders use). That's not always fixable quickly, but it's worth knowing it's the main structural pressure on the rest of the budget.`,
      });
    }
  } else if (totalMonthSpend > 0) {
    const top = [...categorySpend].sort((a, b) => b.amount - a.amount)[0];
    if (top && top.amount / totalMonthSpend > 0.4) {
      insights.push({
        id: "concentration",
        status: "tip",
        icon: "target",
        title: `${top.name} is ${((top.amount / totalMonthSpend) * 100).toFixed(0)}% of this month's spending`,
        body: `${formatCurrencyShort(top.amount)} of this month's ${formatCurrencyShort(totalMonthSpend)} in expenses went to ${top.name} alone. Not necessarily a problem — but when one category dominates like this it's usually the first place to check before assuming a budget needs across-the-board cuts.`,
      });
    }
  }

  // --- Spending anomalies: this month vs. this category's own average -----
  const spikes = categorySpend
    .filter((c) => c.avgAmount > 0 && c.amount > c.avgAmount * 1.5)
    .sort((a, b) => b.amount - b.avgAmount - (a.amount - a.avgAmount))
    .slice(0, 2);
  for (const spike of spikes) {
    insights.push({
      id: `spike-${spike.categoryId}`,
      status: "tip",
      icon: "trending-up",
      title: `${spike.name} spending is up`,
      body: `${formatCurrencyShort(spike.amount)} this month vs. a usual ${formatCurrencyShort(spike.avgAmount)} — about ${(((spike.amount - spike.avgAmount) / spike.avgAmount) * 100).toFixed(0)}% higher than average. Worth a quick check on whether that's a one-off or a new normal.`,
    });
  }

  // --- Subscription load ----------------------------------------------------
  if (avgMonthlyIncome > 0 && monthlySubscriptionCommitment > 0) {
    const subRatio = (monthlySubscriptionCommitment / avgMonthlyIncome) * 100;
    if (subRatio > 10) {
      insights.push({
        id: "subscriptions",
        status: "tip",
        icon: "repeat",
        title: `Subscriptions are ~${subRatio.toFixed(0)}% of income`,
        body: `Recurring subscriptions add up to ${formatCurrencyShort(monthlySubscriptionCommitment)}/month — about ${subRatio.toFixed(0)}% of income. There's no formal rule for this, but subscription creep is one of the easiest places to find money without changing your lifestyle. Worth a quick pass through the Subscriptions tab for anything unused.`,
      });
    }
  }

  // --- Budget adherence ------------------------------------------------------
  if (budgets.length > 0) {
    const over = budgets.filter((b) => b.spent > b.limit);
    if (over.length === 0) {
      insights.push({
        id: "budgets",
        status: "good",
        icon: "list-checks",
        title: `All ${budgets.length} budget${budgets.length === 1 ? "" : "s"} on track`,
        body: `Every category with a budget is within its monthly limit so far. Once this becomes routine, it's usually a good sign you're ready to either tighten the limits or redirect the slack into a Goal.`,
      });
    } else {
      const worst = [...over].sort((a, b) => b.spent - b.limit - (a.spent - a.limit))[0];
      insights.push({
        id: "budgets",
        status: "warning",
        icon: "list-checks",
        title: `${over.length} of ${budgets.length} budgets over limit`,
        body: `${worst.categoryName} is the furthest over, at ${formatCurrencyShort(worst.spent)} against a ${formatCurrencyShort(worst.limit)} limit. If this happens most months, the limit itself may be unrealistic — a budget you consistently blow past stops being useful as a signal.`,
      });
    }
  }

  // --- Goal pacing -----------------------------------------------------------
  for (const goal of goals) {
    if (goal.currentAmount >= goal.targetAmount || !goal.targetDate) continue;
    const monthsLeft = monthsBetween(today, goal.targetDate);
    const remaining = goal.targetAmount - goal.currentAmount;
    if (monthsLeft <= 0) {
      insights.push({
        id: `goal-${goal.name}`,
        status: "warning",
        icon: "flag",
        title: `"${goal.name}" target date has passed`,
        body: `Still ${formatCurrencyShort(remaining)} short with the target date behind you. Worth either pushing the date out or stepping up contributions to close the gap.`,
      });
    } else {
      const perMonth = remaining / monthsLeft;
      insights.push({
        id: `goal-${goal.name}`,
        status: "tip",
        icon: "flag",
        title: `"${goal.name}" needs ~${formatCurrencyShort(perMonth)}/month`,
        body: `To reach ${formatCurrencyShort(goal.targetAmount)} by the target date, you'd need to add about ${formatCurrencyShort(perMonth)}/month from here — ${formatCurrencyShort(remaining)} to go over roughly ${monthsLeft.toFixed(1)} months.`,
      });
    }
  }

  const severity: Record<InsightStatus, number> = { warning: 0, tip: 1, good: 2 };
  return insights.sort((a, b) => severity[a.status] - severity[b.status]).slice(0, 8);
}

function formatPct(n: number): string {
  return n.toFixed(0);
}

function formatCurrencyShort(n: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);
}
