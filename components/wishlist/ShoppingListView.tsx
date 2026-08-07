"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check } from "lucide-react";
import { toggleShoppingListItem, deleteShoppingListItem, clearCheckedShoppingItems } from "@/app/actions/shopping-list";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export type ShoppingListItem = { id: string; name: string; checked: boolean };

function ShoppingRow({ item }: { item: ShoppingListItem }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await toggleShoppingListItem(item.id, !item.checked);
            router.refresh();
          })
        }
        aria-label={item.checked ? "Mark not bought" : "Mark bought"}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
          item.checked ? "border-pink bg-pink text-ink" : "border-border text-transparent"
        )}
      >
        <Check size={14} />
      </button>
      <p className={cn("min-w-0 flex-1 break-words text-sm font-medium", item.checked ? "text-charcoal-soft line-through" : "text-charcoal")}>
        {item.name}
      </p>
      <form action={deleteShoppingListItem.bind(null, item.id)}>
        <button type="submit" aria-label="Delete item" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function ShoppingListView({ items }: { items: ShoppingListItem[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasChecked = items.some((i) => i.checked);

  if (!items.length) {
    return <p className="text-center text-sm text-charcoal-soft">Nothing on the shopping list yet.</p>;
  }

  const sorted = [...items].sort((a, b) => Number(a.checked) - Number(b.checked));

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {sorted.map((item) => (
          <li key={item.id}>
            <ShoppingRow item={item} />
          </li>
        ))}
      </ul>
      {hasChecked && (
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await clearCheckedShoppingItems();
              router.refresh();
            })
          }
          className="w-full"
        >
          Clear checked items
        </Button>
      )}
    </div>
  );
}
