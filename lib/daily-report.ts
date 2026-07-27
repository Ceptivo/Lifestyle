export type ReportTone = "alert" | "tip" | "info";

export type ReportItem = {
  id: string;
  tone: ReportTone;
  icon: string;
  title: string;
  body: string;
  href: string;
};

const SEVERITY: Record<ReportTone, number> = { alert: 0, tip: 1, info: 2 };

export function sortReportItems(items: ReportItem[], limit = 8): ReportItem[] {
  return [...items].sort((a, b) => SEVERITY[a.tone] - SEVERITY[b.tone]).slice(0, limit);
}
