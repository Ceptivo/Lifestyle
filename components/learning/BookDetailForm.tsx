"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { updateBookDetails, deleteBook } from "@/app/actions/learning";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label } from "@/components/ui/Field";
import { StarRatingInput } from "@/components/ui/StarRating";
import type { ReadingStatus } from "@/lib/types";

type BookDetail = {
  id: string;
  status: ReadingStatus;
  progressPct: number;
  description: string | null;
  keyTakeaways: string | null;
  rating: number | null;
  pages: number | null;
};

export function BookDetailForm({ book }: { book: BookDetail }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <form
        action={(formData) => {
          startTransition(async () => {
            await updateBookDetails(book.id, formData);
          });
        }}
        className="space-y-3 rounded-2xl border border-border bg-paper p-4"
      >
        <div>
          <Label>Status</Label>
          <Select name="status" defaultValue={book.status}>
            <option value="want_to_read">Want to read</option>
            <option value="reading">Reading</option>
            <option value="finished">Finished</option>
          </Select>
        </div>
        <div>
          <Label>Progress %</Label>
          <Input name="progressPct" type="number" min="0" max="100" step="1" defaultValue={book.progressPct} />
        </div>
        <div>
          <Label>Pages</Label>
          <Input name="pages" type="number" min="0" step="1" defaultValue={book.pages ?? ""} placeholder="Total pages" />
        </div>
        <div>
          <Label>Rating</Label>
          <StarRatingInput name="rating" defaultValue={book.rating} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea name="description" defaultValue={book.description ?? ""} placeholder="What's this book about?" rows={3} />
        </div>
        <div>
          <Label>Key takeaways</Label>
          <Textarea name="keyTakeaways" defaultValue={book.keyTakeaways ?? ""} placeholder="What did you learn?" rows={3} />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving…" : "Save"}
        </Button>
      </form>

      <form
        action={() =>
          startDelete(async () => {
            await deleteBook(book.id);
            router.push("/learning");
          })
        }
      >
        <button
          type="submit"
          disabled={isDeleting}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border py-2.5 text-sm font-semibold text-danger"
        >
          <Trash2 size={14} /> {isDeleting ? "Deleting…" : "Delete book"}
        </button>
      </form>
    </div>
  );
}
