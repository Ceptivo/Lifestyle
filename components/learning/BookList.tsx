"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";
import { updateBookProgress, deleteBook } from "@/app/actions/learning";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { ReadingStatus } from "@/lib/types";

const STATUS_LABEL: Record<ReadingStatus, string> = {
  want_to_read: "Want to read",
  reading: "Reading",
  finished: "Finished",
};

const STATUS_CLASS: Record<ReadingStatus, string> = {
  want_to_read: "bg-cream text-charcoal-soft",
  reading: "bg-pink-soft text-pink-dark",
  finished: "bg-emerald-500/15 text-emerald-600",
};

export type Book = {
  id: string;
  title: string;
  author: string | null;
  reason: string | null;
  status: ReadingStatus;
  progressPct: number;
  icon: string;
};

function BookCard({ book }: { book: Book }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <Link href={`/learning/books/${book.id}`} className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
            <Icon name={book.icon} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-words hyphens-auto text-sm font-semibold text-charcoal">{book.title}</p>
            {book.author && <p className="text-xs text-charcoal-soft">{book.author}</p>}
            {book.reason && <p className="mt-1 text-xs italic text-charcoal-soft">&ldquo;{book.reason}&rdquo;</p>}
          </div>
        </Link>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => setEditing((v) => !v)} aria-label="Update progress" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal">
            <Pencil size={14} />
          </button>
          <form action={deleteBook.bind(null, book.id)}>
            <button type="submit" aria-label="Delete book" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-pink" style={{ width: `${book.progressPct}%` }} />
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-charcoal-soft">{book.progressPct}%</span>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", STATUS_CLASS[book.status])}>
          {STATUS_LABEL[book.status]}
        </span>
      </div>

      {editing && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateBookProgress(book.id, formData);
              setEditing(false);
            });
          }}
          className="mt-3 space-y-2 rounded-xl border border-border bg-cream p-3"
        >
          <Input name="progressPct" type="number" min="0" max="100" step="1" defaultValue={book.progressPct} placeholder="Progress %" />
          <Select name="status" defaultValue={book.status}>
            <option value="want_to_read">Want to read</option>
            <option value="reading">Reading</option>
            <option value="finished">Finished</option>
          </Select>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Update"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export function BookList({ books }: { books: Book[] }) {
  if (!books.length) {
    return <p className="text-center text-sm text-charcoal-soft">Nothing currently on the go.</p>;
  }

  return (
    <ul className="space-y-2">
      {books.map((b) => (
        <li key={b.id}>
          <BookCard book={b} />
        </li>
      ))}
    </ul>
  );
}
