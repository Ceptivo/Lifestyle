import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/Card";
import { SubscriptionForm } from "@/components/finance/SubscriptionForm";
import { SubscriptionList } from "@/components/finance/SubscriptionList";
import { monthlyEquivalent } from "@/lib/subscriptions";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const supabase = createClient();
  const [{ data: subscriptions }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase
      .from("finance_subscriptions")
      .select("id, name, icon, amount, cycle, account_id, category_id, next_due_date, status")
      .order("next_due_date"),
    supabase.from("finance_accounts").select("id, name").order("created_at"),
    supabase.from("finance_categories").select("id, name").eq("type", "expense").order("name"),
  ]);

  const monthlyCommitment = (subscriptions ?? [])
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.cycle), 0);

  return (
    <div>
      <div className="mb-6">
        <StatCard label="Monthly commitment" value={formatCurrency(monthlyCommitment)} />
      </div>

      <div className="mb-6">
        <SubscriptionForm accounts={accounts ?? []} categories={categories ?? []} />
      </div>

      <SubscriptionList
        subscriptions={(subscriptions ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          icon: s.icon,
          amount: s.amount,
          cycle: s.cycle,
          accountId: s.account_id,
          categoryId: s.category_id,
          nextDueDate: s.next_due_date,
          status: s.status,
          amountFormatted: formatCurrency(s.amount),
          nextDueDateFormatted: formatDate(s.next_due_date),
        }))}
        accounts={accounts ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
