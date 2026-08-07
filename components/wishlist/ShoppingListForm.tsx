"use client";

import { useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { addShoppingListItem } from "@/app/actions/shopping-list";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function ShoppingListForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addShoppingListItem(formData);
          formRef.current?.reset();
        });
      }}
      className="flex gap-2"
    >
      <Input name="name" placeholder="e.g. Milk" required className="flex-1" />
      <Button type="submit" disabled={isPending} className="px-4">
        <Plus size={16} />
      </Button>
    </form>
  );
}
