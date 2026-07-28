import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/finance/AccountForm";
import { AccountList } from "@/components/finance/AccountList";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";
import { formatCurrency } from "@/lib/format";

export const revalidate = 60;

export default async function AccountsPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name, icon, starting_balance").order("created_at"),
    supabase.from("finance_transactions").select("type, amount, account_id"),
  ]);

  const balances = new Map((accounts ?? []).map((a) => [a.id, a.starting_balance]));
  for (const tx of transactions ?? []) {
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    balances.set(tx.account_id, (balances.get(tx.account_id) ?? 0) + delta);
  }

  return (
    <div>
      <FinanceBackLink />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Accounts</h1>

      <div className="mb-6">
        <AccountForm />
      </div>

      <AccountList
        accounts={(accounts ?? []).map((a) => {
          const balance = balances.get(a.id) ?? a.starting_balance;
          return {
            id: a.id,
            name: a.name,
            icon: a.icon,
            startingBalance: a.starting_balance,
            balance,
            balanceFormatted: formatCurrency(balance),
          };
        })}
      />
    </div>
  );
}
