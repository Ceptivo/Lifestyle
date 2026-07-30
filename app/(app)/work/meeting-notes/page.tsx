import { createClient } from "@/lib/supabase/server";
import { MeetingNoteForm } from "@/components/work/MeetingNoteForm";
import { MeetingNoteList, type MeetingNote } from "@/components/work/MeetingNoteList";

export const revalidate = 60;

export default async function WorkMeetingNotesPage() {
  const supabase = createClient();
  const { data: notes } = await supabase.from("work_notes").select("*").order("created_at", { ascending: false });

  const rows: MeetingNote[] = (notes ?? []).map((n) => ({ id: n.id, title: n.title, content: n.content }));

  return (
    <div>
      <div className="mb-6">
        <MeetingNoteForm />
      </div>
      <MeetingNoteList notes={rows} />
    </div>
  );
}
