"use client";

import { useState, useTransition } from "react";
import { Trash2, PiggyBank } from "lucide-react";
import { deleteWishlistItem, moveToFinanceGoal } from "@/app/actions/wishlist";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";

export type WishlistItem = { id: string; name: string; price: number | null; icon: string };
export type WishlistCategoryGroup = { category: string; items: WishlistItem[] };

function WishlistRow({ item }: { item: WishlistItem }) {
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={item.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{item.name}</p>
          <p className="text-xs text-charcoal-soft">{item.price != null ? formatCurrency(item.price) : "No price set"}</p>
        </div>
        <button
          type="button"
          onClick={() => setSaving((s) => !s)}
          aria-label="Save for this in Finance Goals"
          className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-pink-dark"
        >
          <PiggyBank size={16} />
        </button>
        <form action={deleteWishlistItem.bind(null, item.id)}>
          <button type="submit" aria-label="Delete item" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
            <Trash2 size={14} />
          </button>
        </form>
      </div>
      {saving && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await moveToFinanceGoal(item.id, formData);
              setSaving(false);
            });
          }}
          className="mt-2.5 flex items-center gap-1.5"
        >
          <Input
            name="targetAmount"
            type="number"
            inputMode="decimal"
            step="0.01"
            defaultValue={item.price ?? ""}
            placeholder="Target amount"
            required
            className="h-9 flex-1 px-3 py-1.5 text-sm"
          />
          <Button type="submit" disabled={isPending} className="h-9 px-3 py-1.5 text-sm">
            Save to Goals
          </Button>
        </form>
      )}
    </Card>
  );
}

export function WishlistList({ groups }: { groups: WishlistCategoryGroup[] }) {
  if (!groups.length) {
    return <p className="text-center text-sm text-charcoal-soft">Nothing on the list yet. Add your first item.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.category}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">{g.category}</h3>
          <ul className="space-y-2">
            {g.items.map((item) => (
              <li key={item.id}>
                <WishlistRow item={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
