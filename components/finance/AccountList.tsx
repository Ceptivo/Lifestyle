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
          <Input name="balance" type="number" inputMode="decimal" step="0.01" defaultValue={account.balance} />
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
        <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{account.name}</p>
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
          className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
        >
          <Trash2 size={14} />
        </button>
      </form>
    </Card>
  );
}

// Accounts using these icons are grouped under their own heading instead
// of the plain list — the picker's piggy bank for savings, and its
// up-and-to-the-right arrow for investments.
const SAVINGS_ICON = "piggy-bank";
const INVESTMENT_ICON = "trending-up";

function AccountGroup({ heading, accounts }: { heading?: string; accounts: Account[] }) {
  if (!accounts.length) return null;
  return (
    <div>
      {heading && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{heading}</h3>
      )}
      <ul className="space-y-2">
        {accounts.map((account) => (
          <li key={account.id}>
            <AccountCard account={account} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccountList({ accounts }: { accounts: Account[] }) {
  if (!accounts.length) {
    return <p className="text-center text-sm text-charcoal-soft">No accounts yet. Add your first one.</p>;
  }

  const normalAccounts = accounts.filter((a) => a.icon !== SAVINGS_ICON && a.icon !== INVESTMENT_ICON);
  const savingsAccounts = accounts.filter((a) => a.icon === SAVINGS_ICON);
  const investmentAccounts = accounts.filter((a) => a.icon === INVESTMENT_ICON);

  return (
    <div className="space-y-5">
      <AccountGroup accounts={normalAccounts} />
      <AccountGroup heading="Saving Accounts" accounts={savingsAccounts} />
      <AccountGroup heading="Investment Accounts" accounts={investmentAccounts} />
    </div>
  );
}
