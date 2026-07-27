import { Trash2 } from "lucide-react";
import { deleteJournalEntry } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type Entry = {
  id: string;
  entryDateFormatted: string;
  symptom: string;
  severity: number;
  bodyArea: string | null;
  triggers: string | null;
  notes: string | null;
  icon: string;
};

export function JournalEntryList({ entries }: { entries: Entry[] }) {
  if (!entries.length) {
    return <p className="text-center text-sm text-charcoal-soft">No entries logged yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li key={e.id}>
          <Card className="flex items-start gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
              <Icon name={e.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-charcoal">
                {e.symptom} <span className="font-normal text-charcoal-soft">· {e.severity}/10</span>
              </p>
              <p className="text-xs text-charcoal-soft">
                {e.entryDateFormatted}
                {e.bodyArea && ` · ${e.bodyArea}`}
                {e.triggers && ` · Trigger: ${e.triggers}`}
              </p>
              {e.notes && <p className="mt-0.5 text-xs text-charcoal-soft">{e.notes}</p>}
            </div>
            <form action={deleteJournalEntry.bind(null, e.id)}>
              <button
                type="submit"
                aria-label="Delete entry"
                className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
