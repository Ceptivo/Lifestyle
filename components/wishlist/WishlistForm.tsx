"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addWishlistItem } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

const SUGGESTED_CATEGORIES = ["Car", "House", "Personal", "Training"];

export function WishlistForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add item
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addWishlistItem(formData);
          formRef.current?.reset();
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New item</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Item name" required />
      <Input name="category" list="wishlist-categories" placeholder="Category (e.g. Car, House, Personal, Training)" required />
      <datalist id="wishlist-categories">
        {SUGGESTED_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <Input name="price" type="number" inputMode="decimal" step="0.01" placeholder="Price (optional)" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Add item"}
      </Button>
    </form>
  );
}
