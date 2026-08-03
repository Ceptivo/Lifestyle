import { Trash2, Download } from "lucide-react";
import { deleteDocument } from "@/app/actions/personal";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type DocumentFile = { id: string; fileName: string };

export type DocumentRow = {
  id: string;
  name: string;
  category: string;
  files: DocumentFile[];
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
          <Card className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  d.expired ? "bg-danger-soft text-danger" : "bg-pink-soft text-pink-dark"
                )}
              >
                <Icon name="file-text" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{d.name}</p>
                <p className={cn("text-xs", d.expired || d.expiringSoon ? "font-semibold text-danger" : "text-charcoal-soft")}>
                  {d.category}
                  {d.expiryLabel && ` · ${d.expired ? "Expired" : "Expires"} ${d.expiryLabel}`}
                </p>
              </div>
              <form action={deleteDocument.bind(null, d.id)}>
                <button type="submit" aria-label="Delete document" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
            {d.files.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {d.files.map((f) => (
                  <a
                    key={f.id}
                    href={`/api/personal/document-files/${f.id}/download`}
                    className="flex max-w-[180px] items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-pink-soft hover:text-pink-dark"
                  >
                    <Download size={12} className="shrink-0" />
                    <span className="truncate">{d.files.length > 1 ? f.fileName : "Download"}</span>
                  </a>
                ))}
              </div>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}
