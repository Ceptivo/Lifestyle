import { Trash2, ExternalLink } from "lucide-react";
import { deleteMaterial } from "@/app/actions/university";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export type Material = {
  id: string;
  title: string;
  subject: string;
  notes: string | null;
  url: string | null;
  icon: string;
};

export function MaterialList({ materials }: { materials: Material[] }) {
  if (!materials.length) {
    return <p className="text-center text-sm text-charcoal-soft">No study material yet. Add your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {materials.map((m) => (
        <li key={m.id}>
          <Card className="flex items-start gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Icon name={m.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{m.title}</p>
              <p className="text-xs text-charcoal-soft">{m.subject}</p>
              {m.notes && <p className="mt-1 text-xs text-charcoal-soft">{m.notes}</p>}
              {m.url && (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-pink-dark"
                >
                  Open link <ExternalLink size={12} />
                </a>
              )}
            </div>
            <form action={deleteMaterial.bind(null, m.id)}>
              <button type="submit" aria-label="Delete material" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
