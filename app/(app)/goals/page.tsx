import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { GoalStatus } from "@/lib/types";

export const revalidate = 60;

const STATUS_LABEL: Record<GoalStatus, string> = { planned: "Planned", in_progress: "In progress", done: "Done" };
const STATUS_CLASS: Record<GoalStatus, string> = {
  planned: "bg-cream text-charcoal-soft",
  in_progress: "bg-pink-soft text-pink-dark",
  done: "bg-emerald-500/15 text-emerald-600",
};

type StatusGoalRow = { id: string; name: string; icon: string; status: GoalStatus; targetDateFormatted: string | null };
type MoneyGoalRow = { id: string; name: string; icon: string; progressLabel: string; pct: number; achieved: boolean };

function toStatusRows(
  rows: { id: string; name: string; icon: string; status: GoalStatus; target_date: string | null }[] | null
): StatusGoalRow[] {
  return (rows ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    status: g.status,
    targetDateFormatted: g.target_date ? formatDate(g.target_date) : null,
  }));
}

function StatusGoalSection({ title, href, goals }: { title: string; href: string; goals: StatusGoalRow[] }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-pink-dark">
          Manage
        </Link>
      </div>
      {goals.length === 0 ? (
        <p className="text-center text-sm text-charcoal-soft">No {title.toLowerCase()} goals yet.</p>
      ) : (
        <ul className="space-y-2">
          {goals.map((g) => (
            <li key={g.id}>
              <Card className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Icon name={g.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{g.name}</p>
                  {g.targetDateFormatted && <p className="text-xs text-charcoal-soft">{g.targetDateFormatted}</p>}
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", STATUS_CLASS[g.status])}>
                  {STATUS_LABEL[g.status]}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function GoalsPage() {
  const supabase = createClient();
  const [{ data: financeGoals }, { data: healthGoals }, { data: workGoals }, { data: universityGoals }, { data: socialGoals }] =
    await Promise.all([
      supabase.from("finance_goals").select("*").order("created_at", { ascending: false }),
      supabase.from("health_goals").select("*").order("created_at", { ascending: false }),
      supabase.from("work_goals").select("*").order("created_at", { ascending: false }),
      supabase.from("university_goals").select("*").order("created_at", { ascending: false }),
      supabase.from("social_shared_goals").select("*").order("created_at", { ascending: false }),
    ]);

  const financeRows: MoneyGoalRow[] = (financeGoals ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    progressLabel: `${formatCurrency(g.current_amount)} of ${formatCurrency(g.target_amount)}`,
    pct: Math.min(100, (g.current_amount / g.target_amount) * 100),
    achieved: g.current_amount >= g.target_amount,
  }));

  return (
    <div>
      <BackLink href="/" label="Back to Home" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Goals</h1>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Finance</h2>
          <Link href="/finance/goals" className="text-xs font-semibold text-pink-dark">
            Manage
          </Link>
        </div>
        {financeRows.length === 0 ? (
          <p className="text-center text-sm text-charcoal-soft">No finance goals yet.</p>
        ) : (
          <ul className="space-y-2">
            {financeRows.map((g) => (
              <li key={g.id}>
                <Card className="px-4 py-3.5">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                      <Icon name={g.icon} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{g.name}</p>
                      <p className="text-xs text-charcoal-soft">{g.progressLabel}</p>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-cream">
                    <div
                      className={g.achieved ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-pink"}
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <StatusGoalSection title="Health" href="/health/goals" goals={toStatusRows(healthGoals)} />
      <StatusGoalSection title="Work" href="/work" goals={toStatusRows(workGoals)} />
      <StatusGoalSection title="University" href="/university/goals" goals={toStatusRows(universityGoals)} />
      <StatusGoalSection title="Social" href="/social/goals" goals={toStatusRows(socialGoals)} />
    </div>
  );
}
