import { createClient } from "@/lib/supabase/server";
import { DocumentForm } from "@/components/personal/DocumentForm";
import { DocumentList, type DocumentRow } from "@/components/personal/DocumentList";
import { formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

const EXPIRING_SOON_DAYS = 30;

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export default async function DocumentsPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const [{ data: documents }, { data: files }] = await Promise.all([
    supabase.from("personal_documents").select("*").order("expiry_date", { ascending: true, nullsFirst: false }),
    supabase.from("personal_document_files").select("id, document_id, file_name").order("created_at"),
  ]);

  const filesByDocument = new Map<string, { id: string; fileName: string }[]>();
  for (const f of files ?? []) {
    const bucket = filesByDocument.get(f.document_id) ?? [];
    bucket.push({ id: f.id, fileName: f.file_name });
    filesByDocument.set(f.document_id, bucket);
  }

  const rows: DocumentRow[] = (documents ?? []).map((d) => {
    const daysToExpiry = d.expiry_date ? daysBetween(today, d.expiry_date) : null;
    return {
      id: d.id,
      name: d.name,
      category: d.category,
      files: filesByDocument.get(d.id) ?? [],
      expiryLabel: d.expiry_date ? formatDate(d.expiry_date) : null,
      expiringSoon: daysToExpiry != null && daysToExpiry >= 0 && daysToExpiry <= EXPIRING_SOON_DAYS,
      expired: daysToExpiry != null && daysToExpiry < 0,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <DocumentForm />
      </div>
      <DocumentList documents={rows} />
    </div>
  );
}
