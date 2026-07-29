import Link from "next/link";
import { User, NotebookPen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/ui/PageHeading";
import { Card } from "@/components/ui/Card";

export const revalidate = 60;

export default async function ProfilePage() {
  const supabase = createClient();
  const { count } = await supabase
    .from("profile_improvement_notes")
    .select("id", { count: "exact", head: true });

  return (
    <div>
      <PageHeading title="Profile" />

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <User size={24} />
        </span>
        <p className="text-lg font-bold text-charcoal">Luke</p>
      </div>

      <Link href="/profile/notes">
        <Card className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
            <NotebookPen size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-charcoal">Improvement Notes</p>
            <p className="truncate text-xs text-charcoal-soft">
              {count ? `${count} note${count === 1 ? "" : "s"}` : "Write a note to yourself"}
            </p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
