"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addTransaction } from "@/app/actions/finance";
import { addCategory } from "@/app/actions/finance-categories";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { IconPicker } from "@/components/ui/IconPicker";
import { DEFAULT_ICON } from "@/lib/icons";
import { todayLocalDate } from "@/lib/format";
import type { FinanceType } from "@/lib/types";

type Account = { id: string; name: string };
type Category = { id: string; name: string; icon: string; type: FinanceType };

export function AddTransactionForm({
  accounts,
  categories: initialCategories,
  initialOpen = false,
  initialType = "expense",
  onClose,
  onSaved,
}: {
  accounts: Account[];
  categories: Category[];
  initialOpen?: boolean;
  initialType?: FinanceType;
  onClose?: () => void;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [type, setType] = useState<FinanceType>(initialType);
  const [categories, setCategories] = useState(initialCategories);
  const [categoryId, setCategoryId] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState(DEFAULT_ICON);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isSavingCategory, startCategoryTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Add transaction
      </Button>
    );
  }

  const categoriesForType = categories.filter((c) => c.type === type);
  const selectedCategoryId = categoriesForType.some((c) => c.id === categoryId)
    ? categoryId
    : (categoriesForType[0]?.id ?? "");

  function saveNewCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const formData = new FormData();
    formData.set("name", name);
    formData.set("icon", newCategoryIcon);
    formData.set("type", type);

    startCategoryTransition(async () => {
      const id = await addCategory(formData);
      if (id) {
        const created = { id, name, icon: newCategoryIcon, type };
        setCategories((prev) => [...prev, created]);
        setCategoryId(id);
      }
      setNewCategoryName("");
      setNewCategoryIcon(DEFAULT_ICON);
      setAddingCategory(false);
    });
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("categoryId", selectedCategoryId);
        startTransition(async () => {
          await addTransaction(formData);
          formRef.current?.reset();
          setCategoryId("");
          if (onClose) onClose();
          else setOpen(false);
          onSaved?.();
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex rounded-full bg-cream p-1">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                type === t ? "bg-pink text-ink font-semibold" : "text-charcoal-soft"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => (onClose ? onClose() : setOpen(false))}
          aria-label="Close"
          className="p-1 text-charcoal-soft hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>

      <input type="hidden" name="type" value={type} />

      <Input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="Amount" required />

      <Select name="accountId" defaultValue={accounts[0]?.id ?? ""} disabled={!accounts.length}>
        {accounts.length === 0 && <option value="">Add an account first</option>}
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>

      {categoriesForType.length > 0 && (
        <Select key={type} value={selectedCategoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categoriesForType.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      )}

      {!addingCategory ? (
        <button
          type="button"
          onClick={() => setAddingCategory(true)}
          className="text-sm font-medium text-pink-dark"
        >
          + New category
        </button>
      ) : (
        <div className="space-y-2 rounded-xl border border-border bg-cream p-3">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
          />
          <IconPicker name="newCategoryIcon" value={newCategoryIcon} onChange={setNewCategoryIcon} />
          <div className="flex gap-2">
            <Button type="button" onClick={saveNewCategory} disabled={isSavingCategory || !newCategoryName.trim()}>
              {isSavingCategory ? "Saving…" : "Save category"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAddingCategory(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Input name="description" placeholder="Description (optional)" maxLength={200} />

      <Input name="occurredOn" type="date" defaultValue={todayLocalDate()} />

      <Button type="submit" disabled={isPending || !accounts.length || !selectedCategoryId} className="w-full">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
