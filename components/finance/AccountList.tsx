"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { updateAccount, deleteAccount } from "@/app/actions/finance-accounts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { Icon } from "@/components/ui/Icon";

type Account = {
  id: string;
  name: string;
  icon: string;
  startingBalance: number;
  balance: number;
  balanceFormatted: string;
};

function AccountCard({ account }: { account: Account }) {
  const [editing, setEditing] = useState(false);
  const [icon, setIcon] = useState(account.icon);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card className="px-4 py-3.5">
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await updateAccount(account.id, formData);
              setEditing(false);
            });
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Edit account</p>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Cancel"
              className="p-1 text-charcoal-soft hover:text-charcoal"
            >
              <X size={18} />
            </button>
          </div>
          <Input name="name" defaultValue={account.name} required />
          <IconPicker name="icon" value={icon} onChange={setIcon} />
          <Input name="startingBalance" type="number" inputMode="decimal" step="0.01" defaultValue={account.startingBalance} />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={account.icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-charcoal">{account.name}</p>
        <p className="text-base font-bold tabular-nums text-charcoal">{account.balanceFormatted}</p>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Edit account"
        className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <Pencil size={14} />
      </button>
      <form action={deleteAccount.bind(null, account.id)}>
        <button
          type="submit"
          aria-label="Delete account"
          className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-pink"
        >
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

export function AccountList({ accounts }: { accounts: Account[] }) {
  if (!accounts.length) {
    return <p className="text-center text-sm text-charcoal-soft">No accounts yet. Add your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <li key={account.id}>
          <AccountCard account={account} />
        </li>
      ))}
    </ul>
  );
}
