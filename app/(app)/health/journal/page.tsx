import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/ui/BackLink";
import { DiaryEntryForm } from "@/components/health/DiaryEntryForm";
import { DiaryEntryList, type DiaryEntry } from "@/components/health/DiaryEntryList";
import { formatDateHeading } from "@/lib/format";

export const revalidate = 60;

export default async function HealthJournalPage() {
  const supabase = createClient();
  const { data: entries } = await supabase
    .from("health_diary_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  const rows: DiaryEntry[] = (entries ?? []).map((e) => ({
    id: e.id,
    entryDateFormatted: formatDateHeading(e.entry_date),
    content: e.content,
  }));

  return (
    <div>
      <BackLink href="/health" label="Back to Health" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Journal</h1>

      <div className="mb-6">
        <DiaryEntryForm />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Entries</h2>
      <DiaryEntryList entries={rows} />
    </div>
  );
}
