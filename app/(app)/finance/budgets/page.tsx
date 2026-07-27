import { createClient } from "@/lib/supabase/server";
import { BudgetForm } from "@/components/finance/BudgetForm";
import { BudgetList } from "@/components/finance/BudgetList";
import { todayLocalDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const supabase = createClient();
  const [{ data: budgets }, { data: categories }, { data: transactions }] = await Promise.all([
    supabase.from("finance_budgets").select("id, category_id, monthly_limit"),
    supabase.from("finance_categories").select("id, name, icon, type"),
    supabase.from("finance_transactions").select("type, amount, category_id, occurred_on"),
  ]);

  const categoriesById = Object.fromEntries((categories ?? []).map((c) => [c.id, { name: c.name, icon: c.icon }]));
  const monthPrefix = todayLocalDate().slice(0, 7);

  const spentByCategory: Record<string, number> = {};
  for (const tx of transactions ?? []) {
    if (tx.type === "expense" && tx.occurred_on.startsWith(monthPrefix)) {
      spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] ?? 0) + tx.amount;
    }
  }

  const budgetedCategoryIds = new Set((budgets ?? []).map((b) => b.category_id));
  const availableCategories = (categories ?? []).filter(
    (c) => c.type === "expense" && !budgetedCategoryIds.has(c.id)
  );

  return (
    <div>
      <div className="mb-6">
        <BudgetForm categories={availableCategories} />
      </div>

      <BudgetList
        budgets={(budgets ?? []).map((b) => ({
          id: b.id,
          categoryId: b.category_id,
          monthlyLimit: b.monthly_limit,
          spent: spentByCategory[b.category_id] ?? 0,
        }))}
        categoriesById={categoriesById}
      />
    </div>
  );
}
