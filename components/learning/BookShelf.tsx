import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { StarRatingDisplay } from "@/components/ui/StarRating";

export type ShelfBook = { id: string; title: string; author: string | null; icon: string; rating: number | null };

export function BookShelf({ books }: { books: ShelfBook[] }) {
  if (!books.length) {
    return <p className="text-center text-sm text-charcoal-soft">No finished books yet.</p>;
  }

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/learning/books/${book.id}`}
          className="flex w-32 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-paper p-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
            <Icon name={book.icon} size={16} />
          </span>
          <div className="min-w-0">
            <p className="line-clamp-2 break-words text-xs font-semibold text-charcoal">{book.title}</p>
            {book.author && <p className="truncate text-[10px] text-charcoal-soft">{book.author}</p>}
          </div>
          <StarRatingDisplay rating={book.rating} size={10} />
        </Link>
      ))}
    </div>
  );
}
