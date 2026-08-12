import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("id, name").order("created_at");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <BottomNav vehicles={vehicles ?? []} />
    </div>
  );
}
