import { createClient } from "@/lib/supabase/server";
import { GoalForm } from "@/components/finance/GoalForm";
import { GoalList } from "@/components/finance/GoalList";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { formatCurrency, formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function GoalsPage() {
  const supabase = createClient();
  const { data: goals } = await supabase
    .from("finance_goals")
    .select("id, name, icon, target_amount, current_amount, target_date")
    .order("created_at", { ascending: false });

  return (
    <div>
      <FinanceBackLink />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Goals</h1>

      <div className="mb-6">
        <GoalForm />
      </div>

      <GoalList
        goals={(goals ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          targetDate: g.target_date,
          currentAmountFormatted: formatCurrency(g.current_amount),
          targetAmountFormatted: formatCurrency(g.target_amount),
          targetDateFormatted: g.target_date ? formatDate(g.target_date) : null,
        }))}
      />
    </div>
  );
}
