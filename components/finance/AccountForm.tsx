"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addAccount } from "@/app/actions/finance-accounts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { DEFAULT_ICON } from "@/lib/icons";

export function AccountForm() {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add account
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addAccount(formData);
          formRef.current?.reset();
          setIcon(DEFAULT_ICON);
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">New account</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Account name" required />
      <IconPicker name="icon" value={icon} onChange={setIcon} />
      <Input
        name="startingBalance"
        type="number"
        inputMode="decimal"
        step="0.01"
        placeholder="Starting balance (optional, defaults to 0)"
      />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save account"}
      </Button>
    </form>
  );
}
