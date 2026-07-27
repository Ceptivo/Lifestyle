import { Trash2 } from "lucide-react";
import { deleteOccasion } from "@/app/actions/social";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export type OccasionRow = {
  id: string;
  label: string;
  personName: string;
  icon: string;
  nextOccurrenceFormatted: string;
  daysUntilLabel: string;
  giftIdeas: string | null;
};

export function OccasionList({ occasions }: { occasions: OccasionRow[] }) {
  if (!occasions.length) {
    return <p className="text-center text-sm text-charcoal-soft">No occasions tracked yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {occasions.map((o) => (
        <li key={o.id}>
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={o.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-charcoal">
                {o.label} <span className="font-normal text-charcoal-soft">· {o.personName}</span>
              </p>
              <p className="text-xs text-charcoal-soft">
                {o.nextOccurrenceFormatted} · {o.daysUntilLabel}
              </p>
              {o.giftIdeas && <p className="mt-0.5 text-xs text-charcoal-soft">Ideas: {o.giftIdeas}</p>}
            </div>
            <form action={deleteOccasion.bind(null, o.id)}>
              <button type="submit" aria-label="Delete occasion" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
