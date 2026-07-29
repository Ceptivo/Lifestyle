import { createClient } from "@/lib/supabase/server";
import { NoteForm } from "@/components/work/NoteForm";
import { NoteList, type Note } from "@/components/work/NoteList";

export const revalidate = 60;

export default async function WorkNotesPage() {
  const supabase = createClient();
  const { data: notes } = await supabase.from("work_notes").select("*").order("created_at", { ascending: false });

  const rows: Note[] = (notes ?? []).map((n) => ({ id: n.id, title: n.title, content: n.content }));

  return (
    <div>
      <div className="mb-6">
        <NoteForm />
      </div>
      <NoteList notes={rows} />
    </div>
  );
}
