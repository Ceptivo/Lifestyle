import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { BookDetailForm } from "@/components/learning/BookDetailForm";

export const revalidate = 60;

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  const { data: book } = await supabase.from("learning_reading_list").select("*").eq("id", id).maybeSingle();

  if (!book) notFound();

  return (
    <div>
      <Link href="/learning" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-charcoal-soft hover:text-charcoal">
        <ChevronLeft size={16} />
        Back to Learning
      </Link>

      <Card className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={book.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words hyphens-auto text-lg font-bold text-charcoal">{book.title}</p>
          {book.author && <p className="text-sm text-charcoal-soft">{book.author}</p>}
          {book.reason && <p className="mt-1 text-xs italic text-charcoal-soft">&ldquo;{book.reason}&rdquo;</p>}
          <div className="mt-1.5">
            <StarRatingDisplay rating={book.rating} size={16} />
          </div>
        </div>
      </Card>

      <BookDetailForm
        book={{
          id: book.id,
          status: book.status,
          progressPct: book.progress_pct,
          description: book.description,
          keyTakeaways: book.key_takeaways,
          rating: book.rating,
          pages: book.pages,
        }}
      />
    </div>
  );
}
