import { Download, AlertTriangle, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { JournalEntryForm } from "@/components/health/JournalEntryForm";
import { JournalEntryList } from "@/components/health/JournalEntryList";
import { SymptomHeatmap } from "@/components/health/SymptomHeatmap";
import { PainTrendChart } from "@/components/charts/PainTrendChart";
import { BackLink } from "@/components/ui/BackLink";
import { checkEntryForConcern, generatePossibleConditions, NOT_A_DIAGNOSIS_NOTICE } from "@/lib/journal-insights";
import { formatDate, todayLocalDate } from "@/lib/format";

export const revalidate = 60;

export default async function JournalPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const { data: entries } = await supabase
    .from("health_journal_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .limit(100);

  const trendPoints = [...(entries ?? [])]
    .reverse()
    .map((e) => ({ date: e.entry_date, severity: e.severity, dateFormatted: formatDate(e.entry_date), symptom: e.symptom }));

  const monthStart = `${today.slice(0, 7)}-01`;
  const severityByDate = new Map<string, number>();
  for (const e of entries ?? []) {
    if (!e.entry_date.startsWith(today.slice(0, 7))) continue;
    const prev = severityByDate.get(e.entry_date) ?? 0;
    if (e.severity > prev) severityByDate.set(e.entry_date, e.severity);
  }

  const entryRows = (entries ?? []).map((e) => {
    const concern = checkEntryForConcern({
      symptom: e.symptom,
      severity: e.severity,
      bodyArea: e.body_area,
      triggers: e.triggers,
      notes: e.notes,
    });
    return {
      id: e.id,
      entryDateFormatted: formatDate(e.entry_date),
      symptom: e.symptom,
      severity: e.severity,
      bodyArea: e.body_area,
      triggers: e.triggers,
      notes: e.notes,
      icon: e.icon,
      concernReason: concern?.reason ?? null,
    };
  });

  // Only banner the most recent entry (today's) so an old flagged entry
  // doesn't keep resurfacing a stale warning every time the page loads.
  const latestEntry = (entries ?? [])[0];
  const latestConcern =
    latestEntry && latestEntry.entry_date === today
      ? checkEntryForConcern({
          symptom: latestEntry.symptom,
          severity: latestEntry.severity,
          bodyArea: latestEntry.body_area,
          triggers: latestEntry.triggers,
          notes: latestEntry.notes,
        })
      : null;

  const possibleConditions = generatePossibleConditions(
    (entries ?? []).map((e) => ({
      entryDate: e.entry_date,
      symptom: e.symptom,
      bodyArea: e.body_area,
      triggers: e.triggers,
      notes: e.notes,
    })),
    today
  );

  return (
    <div>
      <BackLink href="/health" label="Back to Health" />
      <h1 className="mb-6 text-2xl font-bold text-charcoal">Symptoms</h1>

      <div className="mb-6">
        <JournalEntryForm />
      </div>

      {latestConcern && (
        <Card tone="danger-soft" className="mb-6 flex gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-danger">
              {latestConcern.level === "urgent" ? "This symptom may need prompt attention" : "Worth keeping an eye on"}
            </p>
            <p className="mt-1 text-sm text-danger">{latestConcern.reason}</p>
          </div>
        </Card>
      )}

      {possibleConditions.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Possible diagnostics</h2>
          <Card className="mb-6 space-y-3">
            <p className="flex items-start gap-2 text-xs text-charcoal-soft">
              <Stethoscope size={14} className="mt-0.5 shrink-0" />
              {NOT_A_DIAGNOSIS_NOTICE}
            </p>
            {possibleConditions.map((c) => (
              <div key={c.name} className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold text-charcoal">{c.name}</p>
                <p className="mt-1 text-xs text-charcoal-soft">Matches: {c.matchedOn.join(", ")}</p>
                <p className="mt-1.5 text-sm text-charcoal-soft">{c.advice}</p>
              </div>
            ))}
          </Card>
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Symptom heatmap</h2>
      <Card className="mb-6">
        <SymptomHeatmap monthStart={monthStart} severityByDate={severityByDate} />
      </Card>

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
