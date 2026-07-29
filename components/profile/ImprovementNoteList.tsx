import { Trash2 } from "lucide-react";
import { deleteImprovementNote } from "@/app/actions/profile";
import { Card } from "@/components/ui/Card";

export type ImprovementNote = {
  id: string;
  content: string;
  timestampFormatted: string;
};

export function ImprovementNoteList({ notes }: { notes: ImprovementNote[] }) {
  if (!notes.length) {
    return <p className="text-center text-sm text-charcoal-soft">No improvement notes yet. Write your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <li key={n.id}>
          <Card className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap break-words text-sm text-charcoal">{n.content}</p>
              <form action={deleteImprovementNote.bind(null, n.id)}>
                <button
                  type="submit"
                  aria-label="Delete note"
                  className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
            <p className="mt-2 text-[11px] font-medium text-charcoal-soft">{n.timestampFormatted}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
