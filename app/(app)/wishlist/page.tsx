import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/ui/PageHeading";
import { WishlistForm } from "@/components/wishlist/WishlistForm";
import { WishlistList, type WishlistCategoryGroup, type WishlistItem } from "@/components/wishlist/WishlistList";

export const revalidate = 60;

export default async function WishlistPage() {
  const supabase = createClient();
  const { data: items } = await supabase.from("wishlist_items").select("*").order("created_at", { ascending: false });

  const byCategory = new Map<string, WishlistItem[]>();
  for (const item of items ?? []) {
    const bucket = byCategory.get(item.category) ?? [];
    bucket.push({ id: item.id, name: item.name, price: item.price, icon: item.icon });
    byCategory.set(item.category, bucket);
  }

  const groups: WishlistCategoryGroup[] = [...byCategory.entries()]
    .map(([category, groupItems]) => ({ category, items: groupItems }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return (
    <div>
      <PageHeading title="Things I Need" subtitle="What to buy, grouped by category." />
      <div className="mb-6">
        <WishlistForm />
      </div>
      <WishlistList groups={groups} />
    </div>
  );
}
