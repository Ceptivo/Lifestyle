import { createClient } from "@/lib/supabase/server";
import { BookForm } from "@/components/learning/BookForm";
import { BookList, type Book } from "@/components/learning/BookList";

export const revalidate = 60;

export default async function ReadingListPage() {
  const supabase = createClient();
  const { data: books } = await supabase
    .from("learning_reading_list")
    .select("*")
    .order("created_at", { ascending: false });

  const rows: Book[] = (books ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    reason: b.reason,
    status: b.status,
    progressPct: b.progress_pct,
    icon: b.icon,
  }));

  return (
    <div>
      <div className="mb-6">
        <BookForm />
      </div>
      <BookList books={rows} />
    </div>
  );
}
