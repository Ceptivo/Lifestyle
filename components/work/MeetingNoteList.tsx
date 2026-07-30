"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil } from "lucide-react";
import { updateNote, deleteNote } from "@/app/actions/work";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

export type MeetingNote = {
  id: string;
  title: string;
  content: string;
};

function MeetingNoteCard({ note }: { note: MeetingNote }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card className="px-4 py-3.5">
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateNote(note.id, formData);
              setEditing(false);
            });
          }}
          className="space-y-3"
        >
          <Input name="title" defaultValue={note.title} required />
          <Textarea name="content" defaultValue={note.content} rows={6} />
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words hyphens-auto text-sm font-semibold text-charcoal">{note.title}</p>
          {note.content && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-charcoal-soft">{note.content}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit note"
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <Pencil size={14} />
          </button>
          <form action={deleteNote.bind(null, note.id)}>
            <button type="submit" aria-label="Delete note" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}

export function MeetingNoteList({ notes }: { notes: MeetingNote[] }) {
  if (!notes.length) {
    return <p className="text-center text-sm text-charcoal-soft">No meeting notes yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <li key={n.id}>
          <MeetingNoteCard note={n} />
        </li>
      ))}
    </ul>
  );
}
