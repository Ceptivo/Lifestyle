import { createClient } from "@/lib/supabase/server";
import { BookForm } from "@/components/learning/BookForm";
import { BookList, type Book } from "@/components/learning/BookList";
import { BookShelf, type ShelfBook } from "@/components/learning/BookShelf";

export const revalidate = 60;

export default async function ReadingListPage() {
  const supabase = createClient();
  const { data: books } = await supabase
    .from("learning_reading_list")
    .select("*")
    .order("created_at", { ascending: false });

  const currentlyReading: Book[] = (books ?? [])
    .filter((b) => b.status !== "finished")
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      reason: b.reason,
      status: b.status,
      progressPct: b.progress_pct,
      icon: b.icon,
    }));

  const read: ShelfBook[] = (books ?? [])
    .filter((b) => b.status === "finished")
    .map((b) => ({ id: b.id, title: b.title, author: b.author, icon: b.icon, rating: b.rating }));

  return (
    <div>
      <div className="mb-6">
        <BookForm />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Currently reading</h2>
      <div className="mb-6">
        <BookList books={currentlyReading} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Books read</h2>
      <BookShelf books={read} />
    </div>
  );
}
