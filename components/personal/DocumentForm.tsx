"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { uploadDocument } from "@/app/actions/personal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

const CATEGORIES = ["Insurance", "Warranty", "ID", "Other"];

export function DocumentForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Upload document
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await uploadDocument(formData);
            formRef.current?.reset();
            setOpen(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed");
          }
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">Upload document</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Document name" required />
      <Select name="category" defaultValue="Other">
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Input name="expiryDate" type="date" placeholder="Expiry date (optional)" />
      <input
        name="file"
        type="file"
        required
        accept=".pdf,.png,.jpg,.jpeg,.heic,.doc,.docx"
        className="w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-charcoal file:mr-3 file:rounded-full file:border-0 file:bg-pink-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-pink-dark"
      />
      <p className="text-xs text-charcoal-soft">Up to 10MB.</p>

      {error && <p className="text-xs font-medium text-danger">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
