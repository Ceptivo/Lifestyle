import { createClient } from "@/lib/supabase/server";
import { StatementImportForm } from "@/components/finance/StatementImportForm";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";

export const revalidate = 0;

export default async function FinanceImportPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: categories }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name").order("created_at"),
    supabase.from("finance_categories").select("id, name, type").order("name"),
  ]);

  return (
    <div>
      <FinanceBackLink />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Import Statement</h1>
      <StatementImportForm accounts={accounts ?? []} categories={categories ?? []} />
    </div>
  );
}
