import { createClient } from "@/lib/supabase/server";
import { CategoryBreakdown } from "@/components/finance/CategoryBreakdown";
import { MonthlyTrend } from "@/components/finance/MonthlyTrend";
import { todayLocalDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function lastMonths(count: number): { key: string; label: string }[] {
  const today = new Date(todayLocalDate() + "T00:00:00");
  const result: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    result.push({ key, label });
  }
  return result;
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase.from("finance_transactions").select("type, amount, category_id, occurred_on"),
    supabase.from("finance_categories").select("id, name, icon"),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const monthPrefix = todayLocalDate().slice(0, 7);

  const categoryTotals: Record<string, number> = {};
  const months = lastMonths(6);
  const monthTotals = new Map(months.map((m) => [m.key, { income: 0, expense: 0 }]));

  for (const tx of transactions ?? []) {
    if (tx.type === "expense" && tx.occurred_on.startsWith(monthPrefix)) {
      categoryTotals[tx.category_id] = (categoryTotals[tx.category_id] ?? 0) + tx.amount;
    }

    const txMonth = tx.occurred_on.slice(0, 7);
    const bucket = monthTotals.get(txMonth);
    if (bucket) {
      if (tx.type === "income") bucket.income += tx.amount;
      else bucket.expense += tx.amount;
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">
        Spending by category — this month
      </h2>
      <div className="mb-6">
        <CategoryBreakdown totals={categoryTotals} categoriesById={categoriesById} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Last 6 months</h2>
      <MonthlyTrend
        months={months.map((m) => ({
          label: m.label,
          income: monthTotals.get(m.key)?.income ?? 0,
          expense: monthTotals.get(m.key)?.expense ?? 0,
        }))}
      />
    </div>
  );
}
