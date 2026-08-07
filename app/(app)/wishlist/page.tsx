import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/ui/PageHeading";
import { WishlistForm } from "@/components/wishlist/WishlistForm";
import { WishlistList, type WishlistCategoryGroup, type WishlistItem } from "@/components/wishlist/WishlistList";
import { ShoppingListForm } from "@/components/wishlist/ShoppingListForm";
import { ShoppingListView, type ShoppingListItem } from "@/components/wishlist/ShoppingListView";
import { cn } from "@/lib/cn";

export const revalidate = 60;

const VIEW_TABS = [
  { key: "buy", label: "Things I Need" },
  { key: "shopping", label: "Shopping List" },
] as const;

export default async function WishlistPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const activeView = view === "shopping" ? "shopping" : "buy";

  const supabase = createClient();

  if (activeView === "shopping") {
    const { data: shoppingItems } = await supabase.from("shopping_list_items").select("*").order("created_at", { ascending: true });
    const rows: ShoppingListItem[] = (shoppingItems ?? []).map((i) => ({ id: i.id, name: i.name, checked: i.checked }));

    return (
      <div>
        <PageHeading title="Things I Need" subtitle="What to buy, grouped by category." />
        <ViewTabs activeView={activeView} />
        <div className="mb-6">
          <ShoppingListForm />
        </div>
        <ShoppingListView items={rows} />
      </div>
    );
  }

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
      <ViewTabs activeView={activeView} />
      <div className="mb-6">
        <WishlistForm />
      </div>
      <WishlistList groups={groups} />
    </div>
  );
}

function ViewTabs({ activeView }: { activeView: "buy" | "shopping" }) {
  return (
    <nav className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-hide">
      <ul className="flex w-max gap-1.5">
        {VIEW_TABS.map((tab) => (
          <li key={tab.key}>
            <Link
              href={tab.key === "buy" ? "/wishlist" : "/wishlist?view=shopping"}
              className={cn(
                "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeView === tab.key ? "bg-pink text-ink font-semibold" : "bg-paper text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
