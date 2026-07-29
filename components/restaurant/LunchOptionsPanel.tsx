"use client";

import { useState, useTransition } from "react";
import { ListChecks, Pencil, Plus, Trash2, X } from "lucide-react";
import { addLunchOption, updateLunchOption, deleteLunchOption } from "@/app/actions/restaurant-savers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type LunchOption = { id: string; name: string; notes: string | null; icon: string };

function OptionForm({ option, onDone }: { option?: LunchOption; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          if (option) {
            await updateLunchOption(option.id, formData);
          } else {
            await addLunchOption(formData);
          }
          onDone();
        });
      }}
      className="space-y-2.5 rounded-2xl border border-border bg-cream p-3.5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{option ? "Edit option" : "Add option"}</p>
        <button type="button" onClick={onDone} aria-label="Cancel" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={16} />
        </button>
      </div>
      <Input name="name" defaultValue={option?.name ?? ""} placeholder="e.g. Chicken wrap from Nino's" required />
      <Input name="notes" defaultValue={option?.notes ?? ""} placeholder="Notes (optional)" />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function OptionRow({ option, onEdit }: { option: LunchOption; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
        <Icon name={option.icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{option.name}</p>
        {option.notes && <p className="break-words hyphens-auto text-xs text-charcoal-soft">{option.notes}</p>}
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit lunch option"
        className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => deleteLunchOption(option.id))}
        aria-label="Delete lunch option"
        className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export function LunchOptionsPanel({ options }: { options: LunchOption[] }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open lunch options"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <ListChecks size={20} />
      </button>

      <div
        className={cn("fixed inset-0 z-50 bg-black/50 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-paper p-5 shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Lunch options"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-lg font-bold text-charcoal">Lunch options</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <X size={20} />
          </button>
        </div>

        {options.length === 0 && !adding && <p className="mb-3 text-sm text-charcoal-soft">No lunch options yet.</p>}

        {options.length > 0 && (
          <div className="mb-3 divide-y divide-border">
            {options.map((option) =>
              editingId === option.id ? (
                <div key={option.id} className="py-1.5">
                  <OptionForm option={option} onDone={() => setEditingId(null)} />
                </div>
              ) : (
                <OptionRow key={option.id} option={option} onEdit={() => setEditingId(option.id)} />
              )
            )}
          </div>
        )}

        {adding ? (
          <OptionForm onDone={() => setAdding(false)} />
        ) : (
          <Button onClick={() => setAdding(true)} className="w-full">
            <Plus size={16} /> Add option
          </Button>
        )}
      </div>
    </>
  );
}
