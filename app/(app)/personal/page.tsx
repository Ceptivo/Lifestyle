import { createClient } from "@/lib/supabase/server";
import { DocumentForm } from "@/components/personal/DocumentForm";
import { DocumentList, type DocumentRow } from "@/components/personal/DocumentList";
import { formatDate, todayLocalDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const EXPIRING_SOON_DAYS = 30;

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export default async function DocumentsPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const { data: documents } = await supabase
    .from("personal_documents")
    .select("*")
    .order("expiry_date", { ascending: true, nullsFirst: false });

  const rows: DocumentRow[] = (documents ?? []).map((d) => {
    const daysToExpiry = d.expiry_date ? daysBetween(today, d.expiry_date) : null;
    return {
      id: d.id,
      name: d.name,
      category: d.category,
      fileName: d.file_name,
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
