import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [{ data: accounts }, { data: categories }] = await Promise.all([
    supabase.from("finance_accounts").select("id, name").order("created_at"),
    supabase.from("finance_categories").select("id, name, icon, type").order("name"),
  ]);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <BottomNav accounts={accounts ?? []} categories={categories ?? []} />
    </div>
  );
}
