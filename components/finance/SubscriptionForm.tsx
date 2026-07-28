"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addSubscription } from "@/app/actions/finance-subscriptions";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { DEFAULT_ICON } from "@/lib/icons";
import { CYCLE_LABEL } from "@/lib/subscriptions";
import { todayLocalDate } from "@/lib/format";
import type { SubscriptionCycle } from "@/lib/types";

type Account = { id: string; name: string };
type Category = { id: string; name: string };

export function SubscriptionForm({ accounts, categories }: { accounts: Account[]; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full" disabled={!accounts.length || !categories.length}>
        <Plus size={16} /> Add subscription
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addSubscription(formData);
          formRef.current?.reset();
          setIcon(DEFAULT_ICON);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New subscription</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Subscription name" required />
      <IconPicker name="icon" value={icon} onChange={setIcon} />
      <Input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="Amount" required />

      <Select name="cycle" defaultValue="monthly">
        {(Object.entries(CYCLE_LABEL) as [SubscriptionCycle, string][]).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select name="accountId" defaultValue={accounts[0]?.id ?? ""}>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>

      <Select name="categoryId" defaultValue={categories[0]?.id ?? ""}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select name="destinationAccountId" defaultValue="">
        <option value="">Not a transfer</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            Transfer into {a.name}
          </option>
        ))}
      </Select>

      <Input name="nextDueDate" type="date" defaultValue={todayLocalDate()} required />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save subscription"}
      </Button>
    </form>
  );
}
