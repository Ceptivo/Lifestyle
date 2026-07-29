import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/ui/BackLink";
import { ImprovementNoteForm } from "@/components/profile/ImprovementNoteForm";
import { ImprovementNoteList, type ImprovementNote } from "@/components/profile/ImprovementNoteList";
import { formatDateTime } from "@/lib/format";

export const revalidate = 60;

export default async function ImprovementNotesPage() {
  const supabase = createClient();
  const { data: notes } = await supabase
    .from("profile_improvement_notes")
    .select("*")
    .order("created_at", { ascending: false });

  const rows: ImprovementNote[] = (notes ?? []).map((n) => ({
    id: n.id,
    content: n.content,
    timestampFormatted: formatDateTime(n.created_at),
  }));

  return (
    <div>
      <BackLink href="/profile" label="Back to Profile" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Improvement Notes</h1>

      <div className="mb-6">
        <ImprovementNoteForm />
      </div>

      <ImprovementNoteList notes={rows} />
    </div>
  );
}
