"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Trash2, X, Pause, Play } from "lucide-react";
import {
  updateSubscription,
  updateSubscriptionStatus,
  markSubscriptionPaid,
  deleteSubscription,
} from "@/app/actions/finance-subscriptions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { Icon } from "@/components/ui/Icon";
import { CYCLE_LABEL } from "@/lib/subscriptions";
import type { SubscriptionCycle, SubscriptionStatus } from "@/lib/types";

type Account = { id: string; name: string };
type Category = { id: string; name: string };
type Subscription = {
  id: string;
  name: string;
  icon: string;
  amount: number;
  cycle: SubscriptionCycle;
  accountId: string;
  categoryId: string;
  destinationAccountId: string | null;
  nextDueDate: string;
  status: SubscriptionStatus;
  amountFormatted: string;
  nextDueDateFormatted: string;
};

function SubscriptionCard({
  subscription,
  accounts,
  categories,
}: {
  subscription: Subscription;
  accounts: Account[];
  categories: Category[];
}) {
  const [editing, setEditing] = useState(false);
  const [icon, setIcon] = useState(subscription.icon);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isPaying, startPayTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();
  const paused = subscription.status === "paused";
  const destinationAccount = accounts.find((a) => a.id === subscription.destinationAccountId);

  if (editing) {
    return (
      <Card className="px-4 py-3.5">
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await updateSubscription(subscription.id, formData);
              setEditing(false);
            });
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Edit subscription</p>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Cancel"
              className="p-1 text-charcoal-soft hover:text-charcoal"
            >
              <X size={18} />
            </button>
          </div>
          <Input name="name" defaultValue={subscription.name} required />
          <IconPicker name="icon" value={icon} onChange={setIcon} />
          <Input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" defaultValue={subscription.amount} required />
          <Select name="cycle" defaultValue={subscription.cycle}>
            {(Object.entries(CYCLE_LABEL) as [SubscriptionCycle, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="accountId" defaultValue={subscription.accountId}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select name="categoryId" defaultValue={subscription.categoryId}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select name="destinationAccountId" defaultValue={subscription.destinationAccountId ?? ""}>
            <option value="">Not a transfer</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                Transfer into {a.name}
              </option>
            ))}
          </Select>
          <Input name="nextDueDate" type="date" defaultValue={subscription.nextDueDate} required />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={subscription.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{subscription.name}</p>
          <p className="text-xs text-charcoal-soft">
            {subscription.amountFormatted} · {CYCLE_LABEL[subscription.cycle]}
            {paused ? " · Paused" : ` · Next ${subscription.nextDueDateFormatted}`}
          </p>
          {destinationAccount && (
            <p className="text-xs text-pink-dark">→ Transfer into {destinationAccount.name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit subscription"
          className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
        >
          <Pencil size={14} />
        </button>
        <form action={deleteSubscription.bind(null, subscription.id)}>
          <button
            type="submit"
            aria-label="Delete subscription"
            className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={isToggling}
          onClick={() =>
            startToggleTransition(async () => {
              await updateSubscriptionStatus(subscription.id, paused ? "active" : "paused");
            })
          }
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={isPaying || paused}
          onClick={() =>
            startPayTransition(async () => {
              await markSubscriptionPaid(subscription.id);
            })
          }
        >
          {isPaying ? "Paying…" : "Pay now"}
        </Button>
      </div>
    </Card>
  );
}

export function SubscriptionList({
  subscriptions,
  accounts,
  categories,
}: {
  subscriptions: Subscription[];
  accounts: Account[];
  categories: Category[];
}) {
  if (!subscriptions.length) {
    return <p className="text-center text-sm text-charcoal-soft">No subscriptions yet. Add your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {subscriptions.map((subscription) => (
        <li key={subscription.id}>
          <SubscriptionCard subscription={subscription} accounts={accounts} categories={categories} />
        </li>
      ))}
    </ul>
  );
}
