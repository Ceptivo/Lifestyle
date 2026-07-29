import Link from "next/link";
import { Wallet, HeartPulse, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { ReportList } from "@/components/home/ReportList";
import { generateInsights } from "@/lib/insights";
import { computeForecast } from "@/lib/forecast";
import { generateSleepInsight } from "@/lib/health-insights";
import { monthlyEquivalent } from "@/lib/subscriptions";
import { mondayOf } from "@/lib/health";
import { daysBetween, nextOccurrence } from "@/lib/social";
import { formatCurrency, todayLocalDate } from "@/lib/format";
import { sortReportItems, type ReportItem } from "@/lib/daily-report";
import { financialMonthKey, financialMonthRange, shiftFinancialMonthKey } from "@/lib/financial-month";

export const revalidate = 60;

const USER_NAME = "Luke";
const HISTORY_MONTHS = 3;

function greeting(hour: number): string {
  if (hour < 5) return `Still up, ${USER_NAME}?`;
  if (hour < 12) return `Good morning, ${USER_NAME}.`;
  if (hour < 18) return `Good afternoon, ${USER_NAME}.`;
  return `Good evening, ${USER_NAME}.`;
}

export default async function HomePage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const now = new Date();
  const dateLabel = new Date(today + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [
    { data: accounts },
    { data: transactions },
    { data: categories },
    { data: budgets },
    { data: subscriptions },
    { data: goals },
    { data: races },
    { data: sleepLogs },
    { data: people },
    { data: interactions },
    { data: occasions },
  ] = await Promise.all([
    supabase.from("finance_accounts").select("starting_balance"),
    supabase.from("finance_transactions").select("type, amount, occurred_on, category_id, subscription_id"),
    supabase.from("finance_categories").select("id, name"),
    supabase.from("finance_budgets").select("category_id, monthly_limit"),
    supabase.from("finance_subscriptions").select("id, name, amount, next_due_date, cycle, is_mandatory").eq("status", "active"),
    supabase.from("finance_goals").select("name, current_amount, target_amount, target_date"),
    supabase.from("health_races").select("id, name, division, location, event_date").gte("event_date", today).order("event_date", { ascending: true }),
    supabase.from("health_sleep_logs").select("sleep_date, duration_hours, mood_next_day, energy_next_day").order("sleep_date", { ascending: false }).limit(60),
    supabase.from("social_people").select("*"),
    supabase.from("social_interactions").select("person_id, occurred_on").order("occurred_on", { ascending: false }),
    supabase.from("social_occasions").select("*"),
  ]);

  const weekStart = mondayOf(today);
  const { data: currentWeek } = await supabase.from("health_training_weeks").select("id").eq("week_start_date", weekStart).maybeSingle();
  let todayPlanTitle: string | null = null;
  if (currentWeek) {
    const todayDayOfWeek = (new Date(today + "T00:00:00").getDay() + 6) % 7;
    const { data: item } = await supabase
      .from("health_training_plan_items")
      .select("title")
      .eq("week_id", currentWeek.id)
      .eq("day_of_week", todayDayOfWeek)
      .maybeSingle();
    todayPlanTitle = item?.title ?? null;
  }

  // --- Finance: balance, this-month figures, trailing averages ------------
  const monthPrefix = financialMonthKey(today);
  const { start: monthStart, end: monthEnd } = financialMonthRange(monthPrefix);
  const monthKeys = Array.from({ length: HISTORY_MONTHS }, (_, i) => shiftFinancialMonthKey(monthPrefix, -(HISTORY_MONTHS - 1 - i)));
  const priorMonthKeys = monthKeys.filter((k) => k !== monthPrefix);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));
  const monthlyIncome = new Map(monthKeys.map((k) => [k, 0]));
  const monthlyExpense = new Map(monthKeys.map((k) => [k, 0]));
  const monthlyCategorySpend = new Map(monthKeys.map((k) => [k, {} as Record<string, number>]));

  let balance = (accounts ?? []).reduce((sum, a) => sum + a.starting_balance, 0);
  let monthExpense = 0;

  for (const tx of transactions ?? []) {
    balance += tx.type === "income" ? tx.amount : -tx.amount;
    if (tx.type === "expense" && tx.occurred_on >= monthStart && tx.occurred_on <= monthEnd) monthExpense += tx.amount;

    const txMonth = financialMonthKey(tx.occurred_on);
    if (monthlyIncome.has(txMonth)) {
      if (tx.type === "income") monthlyIncome.set(txMonth, (monthlyIncome.get(txMonth) ?? 0) + tx.amount);
      else {
        monthlyExpense.set(txMonth, (monthlyExpense.get(txMonth) ?? 0) + tx.amount);
        const bucket = monthlyCategorySpend.get(txMonth)!;
        bucket[tx.category_id] = (bucket[tx.category_id] ?? 0) + tx.amount;
      }
    }
  }

  const monthIncome = monthlyIncome.get(monthPrefix) ?? 0;
  const activePriorMonths = priorMonthKeys.filter((k) => (monthlyIncome.get(k) ?? 0) > 0 || (monthlyExpense.get(k) ?? 0) > 0);
  const monthsOfHistory = activePriorMonths.length;
  const avgMonthlyIncome = monthsOfHistory > 0 ? activePriorMonths.reduce((sum, k) => sum + (monthlyIncome.get(k) ?? 0), 0) / monthsOfHistory : monthIncome;
  const avgMonthlyExpense = monthsOfHistory > 0 ? activePriorMonths.reduce((sum, k) => sum + (monthlyExpense.get(k) ?? 0), 0) / monthsOfHistory : monthExpense;

  const thisMonthCategoryTotals = monthlyCategorySpend.get(monthPrefix) ?? {};
  const categorySpend = Object.entries(thisMonthCategoryTotals).map(([categoryId, amount]) => {
    const avgAmount = monthsOfHistory > 0 ? activePriorMonths.reduce((sum, k) => sum + (monthlyCategorySpend.get(k)?.[categoryId] ?? 0), 0) / monthsOfHistory : 0;
    return { categoryId, name: categoriesById[categoryId] ?? "Uncategorized", amount, avgAmount };
  });

  const budgetsWithSpend = (budgets ?? []).map((b) => ({
    categoryName: categoriesById[b.category_id] ?? "Uncategorized",
    limit: b.monthly_limit,
    spent: thisMonthCategoryTotals[b.category_id] ?? 0,
  }));
  const overBudgets = budgetsWithSpend.filter((b) => b.spent > b.limit);

  const monthlySubscriptionCommitment = (subscriptions ?? []).reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.cycle), 0);

  const forecast = computeForecast(accounts ?? [], transactions ?? [], subscriptions ?? []);

  const financeInsights = generateInsights({
    netWorth: balance,
    avgMonthlyIncome,
    avgMonthlyExpense,
    monthsOfHistory,
    categorySpend,
    monthlySubscriptionCommitment,
    budgets: budgetsWithSpend,
    goals: (goals ?? []).map((g) => ({ name: g.name, currentAmount: g.current_amount, targetAmount: g.target_amount, targetDate: g.target_date })),
    today,
    forecast: {
      firstNegativeLabel: forecast.firstNegative?.label ?? null,
      monthlyNet: forecast.monthlyNet,
      biggestSubscription: forecast.biggestCancellableSubscription
        ? { name: forecast.biggestCancellableSubscription.name, amount: forecast.biggestCancellableSubscription.amount }
        : null,
    },
  });
  const topFinanceInsight = financeInsights.find((i) => i.id !== "budgets");

  // --- Sleep insight ---------------------------------------------------------
  const sleepEntries = (sleepLogs ?? []).map((l) => ({ durationHours: l.duration_hours, moodNextDay: l.mood_next_day, energyNextDay: l.energy_next_day }));
  const sleepInsight = generateSleepInsight(sleepEntries);
  const recentSleep = sleepEntries.map((e) => e.durationHours).filter((v): v is number => v != null).slice(0, 7);
  const avgSleep = recentSleep.length ? recentSleep.reduce((sum, v) => sum + v, 0) / recentSleep.length : null;
  const todaySleepLogged = (sleepLogs ?? []).some((l) => l.sleep_date === today);

  // --- Social: overdue people + upcoming occasions --------------------------
  const lastContactByPerson = new Map<string, string>();
  for (const i of interactions ?? []) {
    if (!lastContactByPerson.has(i.person_id)) lastContactByPerson.set(i.person_id, i.occurred_on);
  }
  const overduePeople = (people ?? [])
    .map((p) => {
      const last = lastContactByPerson.get(p.id);
      const daysSince = last ? daysBetween(last, today) : null;
      return { ...p, daysSince };
    })
    .filter((p) => p.daysSince == null || p.daysSince > p.interaction_period_days)
    .sort((a, b) => (b.daysSince ?? 9999) - (a.daysSince ?? 9999));

  const peopleById = Object.fromEntries((people ?? []).map((p) => [p.id, p.name]));
  const upcomingOccasions = (occasions ?? [])
    .map((o) => {
      const next = nextOccurrence(o.occasion_date, today, o.recurring);
      return { ...o, next, daysUntil: daysBetween(today, next) };
    })
    .filter((o) => o.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // --- Assemble the briefing ---------------------------------------------------
  const items: ReportItem[] = [];

  for (const p of overduePeople.slice(0, 3)) {
    items.push({
      id: `social-${p.id}`,
      tone: "alert",
      icon: p.icon,
      title: `Reach out to ${p.name}`,
      body: p.daysSince == null ? "No contact logged yet" : `${p.daysSince}d since last contact`,
      href: `/social/people/${p.id}`,
    });
  }

  for (const o of upcomingOccasions) {
    items.push({
      id: `occasion-${o.id}`,
      tone: o.daysUntil <= 2 ? "alert" : "tip",
      icon: o.icon,
      title: `${o.label} · ${peopleById[o.person_id] ?? "Someone"}`,
      body: o.daysUntil === 0 ? "Today!" : o.daysUntil === 1 ? "Tomorrow" : `In ${o.daysUntil} days`,
      href: "/social/occasions",
    });
  }

  if (overBudgets.length > 0) {
    const worst = [...overBudgets].sort((a, b) => b.spent - b.limit - (a.spent - a.limit))[0];
    items.push({
      id: "budgets-over",
      tone: "alert",
      icon: "list-checks",
      title: `${overBudgets.length} budget${overBudgets.length === 1 ? "" : "s"} over limit`,
      body: `${worst.categoryName}: ${formatCurrency(worst.spent)} of ${formatCurrency(worst.limit)}`,
      href: "/finance/budgets",
    });
  }

  for (const s of subscriptions ?? []) {
    const daysUntilDue = daysBetween(today, s.next_due_date);
    if (daysUntilDue >= 0 && daysUntilDue <= 3) {
      items.push({
        id: `sub-${s.id}`,
        tone: daysUntilDue === 0 ? "alert" : "tip",
        icon: "repeat",
        title: `${s.name} due ${daysUntilDue === 0 ? "today" : `in ${daysUntilDue}d`}`,
        body: formatCurrency(s.amount),
        href: "/finance/subscriptions",
      });
    }
  }

  const nextRace = (races ?? [])[0];
  if (nextRace) {
    const daysUntilRace = daysBetween(today, nextRace.event_date);
    if (daysUntilRace <= 30) {
      items.push({
        id: `race-${nextRace.id}`,
        tone: daysUntilRace <= 7 ? "alert" : "tip",
        icon: "flag",
        title: `${nextRace.name} in ${daysUntilRace}d`,
        body: [nextRace.division, nextRace.location].filter(Boolean).join(" · ") || "Race day is coming up",
        href: "/health/training",
      });
    }
  }

  if (todayPlanTitle) {
    items.push({
      id: "training-today",
      tone: "info",
      icon: "dumbbell",
      title: "Today's training",
      body: todayPlanTitle,
      href: "/health/training",
    });
  }

  if (topFinanceInsight) {
    items.push({
      id: `finance-${topFinanceInsight.id}`,
      tone: topFinanceInsight.status === "warning" ? "alert" : "tip",
      icon: topFinanceInsight.icon,
      title: topFinanceInsight.title,
      body: topFinanceInsight.body,
      href: "/finance/profile",
    });
  }

  if (sleepInsight) {
    items.push({ id: "sleep-insight", tone: "info", icon: "moon", title: "Sleep pattern", body: sleepInsight, href: "/health/sleep" });
  }

  if (!todaySleepLogged) {
    items.push({
      id: "sleep-log-reminder",
      tone: "alert",
      icon: "moon",
      title: "Log last night's sleep",
      body: "You haven't logged today's sleep yet — takes 10 seconds.",
      href: "/health/sleep",
    });
  }

  const reportItems = sortReportItems(items);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">{greeting(now.getHours())}</h1>
        <p className="mt-1 text-sm text-charcoal-soft">{dateLabel} · Here&rsquo;s your day at a glance.</p>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Today&rsquo;s briefing</h2>
      <div className="mb-6">
        <ReportList items={reportItems} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Your spaces</h2>
      <ul className="space-y-4">
        <li>
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
        </li>

        <li>
          <Link href="/health">
            <Card className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <HeartPulse size={20} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-charcoal">Health</p>
                  <p className="truncate text-xs text-charcoal-soft">
                    {nextRace ? `${nextRace.name} in ${daysBetween(today, nextRace.event_date)}d` : "Training, sleep & journal"}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-lg font-bold tabular-nums text-charcoal">{avgSleep != null ? `${avgSleep.toFixed(1)}h` : "—"}</p>
            </Card>
          </Link>
        </li>

        <li>
          <Link href="/social">
            <Card className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Users size={20} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-charcoal">Social</p>
                  <p className="truncate text-xs text-charcoal-soft">
                    {overduePeople.length > 0 ? `${overduePeople.length} to reach out to` : "You're all caught up"}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-lg font-bold tabular-nums text-charcoal">{(people ?? []).length}</p>
            </Card>
          </Link>
        </li>
      </ul>
    </div>
  );
}
