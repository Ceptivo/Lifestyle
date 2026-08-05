"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { updateDiaryEntry, deleteDiaryEntry } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export type DiaryEntry = { id: string; entryDateFormatted: string; content: string };

function DiaryEditForm({ entry, onDone }: { entry: DiaryEntry; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updateDiaryEntry(entry.id, formData);
          onDone();
        });
      }}
      className="mt-2 space-y-2"
    >
      <Textarea name="content" defaultValue={entry.content} rows={5} required className="text-sm" />
      <div className="flex gap-1.5">
        <Button type="submit" disabled={isPending} className="h-8 flex-1 px-3 py-1.5 text-xs">
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone} className="h-8 px-3 py-1.5 text-xs">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DiaryRow({ entry }: { entry: DiaryEntry }) {
  const [editing, setEditing] = useState(false);

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{entry.entryDateFormatted}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-label={editing ? "Cancel edit" : "Edit entry"}
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            {editing ? <X size={14} /> : <Pencil size={13} />}
          </button>
          <form action={deleteDiaryEntry.bind(null, entry.id)}>
            <button type="submit" aria-label="Delete entry" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>
      {editing ? (
        <DiaryEditForm entry={entry} onDone={() => setEditing(false)} />
      ) : (
        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-charcoal">{entry.content}</p>
      )}
    </Card>
  );
}

export function DiaryEntryList({ entries }: { entries: DiaryEntry[] }) {
  if (!entries.length) {
    return <p className="text-center text-sm text-charcoal-soft">No entries yet. Write about your day.</p>;
  }

  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li key={e.id}>
          <DiaryRow entry={e} />
        </li>
      ))}
    </ul>
  );
}
