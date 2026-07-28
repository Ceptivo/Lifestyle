import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/finance/CategoryForm";
import { CategoryList } from "@/components/finance/CategoryList";
import { FinanceBackLink } from "@/components/finance/FinanceBackLink";

export const revalidate = 60;

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("finance_categories").select("id, name, icon, type").order("name");

  return (
    <div>
      <FinanceBackLink />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Categories</h1>

      <div className="mb-6">
        <CategoryForm />
      </div>

      <CategoryList categories={categories ?? []} />
    </div>
  );
}
