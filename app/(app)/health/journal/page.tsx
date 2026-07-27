import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { JournalEntryForm } from "@/components/health/JournalEntryForm";
import { JournalEntryList } from "@/components/health/JournalEntryList";
import { PainTrendChart } from "@/components/charts/PainTrendChart";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const supabase = createClient();
  const { data: entries } = await supabase
    .from("health_journal_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .limit(100);

  const trendPoints = [...(entries ?? [])]
    .reverse()
    .map((e) => ({ date: e.entry_date, severity: e.severity, dateFormatted: formatDate(e.entry_date), symptom: e.symptom }));

  const entryRows = (entries ?? []).map((e) => ({
    id: e.id,
    entryDateFormatted: formatDate(e.entry_date),
    symptom: e.symptom,
    severity: e.severity,
    bodyArea: e.body_area,
    triggers: e.triggers,
    notes: e.notes,
    icon: e.icon,
  }));

  return (
    <div>
      <div className="mb-6">
        <JournalEntryForm />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Severity over time</h2>
        <a
          href="/api/health/journal-export"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-dark"
        >
          <Download size={13} /> Export CSV
        </a>
      </div>
      <Card className="mb-6">
        <PainTrendChart points={trendPoints} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Entries</h2>
      <JournalEntryList entries={entryRows} />
    </div>
  );
}
