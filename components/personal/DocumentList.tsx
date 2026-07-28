import { Trash2, Download } from "lucide-react";
import { deleteDocument } from "@/app/actions/personal";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type DocumentRow = {
  id: string;
  name: string;
  category: string;
  fileName: string;
  expiryLabel: string | null;
  expiringSoon: boolean;
  expired: boolean;
};

export function DocumentList({ documents }: { documents: DocumentRow[] }) {
  if (!documents.length) {
    return <p className="text-center text-sm text-charcoal-soft">No documents uploaded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((d) => (
        <li key={d.id}>
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                d.expired ? "bg-danger-soft text-danger" : "bg-pink-soft text-pink-dark"
              )}
            >
              <Icon name="file-text" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal">{d.name}</p>
              <p className={cn("text-xs", d.expired || d.expiringSoon ? "font-semibold text-danger" : "text-charcoal-soft")}>
                {d.category}
                {d.expiryLabel && ` · ${d.expired ? "Expired" : "Expires"} ${d.expiryLabel}`}
              </p>
            </div>
            <a
              href={`/api/personal/documents/${d.id}/download`}
              aria-label="Download document"
              className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
            >
              <Download size={16} />
            </a>
            <form action={deleteDocument.bind(null, d.id)}>
              <button type="submit" aria-label="Delete document" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
