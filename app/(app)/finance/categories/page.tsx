import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/finance/CategoryForm";
import { CategoryList } from "@/components/finance/CategoryList";

export const revalidate = 60;

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("finance_categories").select("id, name, icon, type").order("name");

  return (
    <div>
      <div className="mb-6">
        <CategoryForm />
      </div>

      <CategoryList categories={categories ?? []} />
    </div>
  );
}
