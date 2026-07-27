import { Trash2 } from "lucide-react";
import { deleteInteraction } from "@/app/actions/social";
import { Card } from "@/components/ui/Card";

type Interaction = { id: string; occurredOnFormatted: string; interactionType: string; notes: string | null };

export function InteractionList({ interactions }: { interactions: Interaction[] }) {
  if (!interactions.length) {
    return <p className="text-center text-sm text-charcoal-soft">No interactions logged yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {interactions.map((i) => (
        <li key={i.id}>
          <Card className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-charcoal">
                {i.interactionType} <span className="font-normal text-charcoal-soft">· {i.occurredOnFormatted}</span>
              </p>
              {i.notes && <p className="text-xs text-charcoal-soft">{i.notes}</p>}
            </div>
            <form action={deleteInteraction.bind(null, i.id)}>
              <button
                type="submit"
                aria-label="Delete interaction"
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
