import { createClient } from "@/lib/supabase/server";
import { GradeForm } from "@/components/university/GradeForm";
import { GradeList, type GradeSubjectGroup } from "@/components/university/GradeList";

export const revalidate = 60;

export default async function ReportCardPage() {
  const supabase = createClient();
  const { data: grades } = await supabase
    .from("university_grades")
    .select("*")
    .order("created_at", { ascending: false });

  const bySubject = new Map<string, { markSum: number; maxSum: number; entries: typeof grades }>();
  for (const g of grades ?? []) {
    const bucket = bySubject.get(g.subject) ?? { markSum: 0, maxSum: 0, entries: [] };
    bucket.markSum += g.mark;
    bucket.maxSum += g.max_mark;
    bucket.entries!.push(g);
    bySubject.set(g.subject, bucket);
  }

  const groups: GradeSubjectGroup[] = [...bySubject.entries()]
    .map(([subject, { markSum, maxSum, entries }]) => {
      const averagePct = maxSum > 0 ? Math.round((markSum / maxSum) * 100) : 0;
      return {
        subject,
        averagePct,
        averagePctFormatted: `${averagePct}%`,
        entries: (entries ?? []).map((e) => ({
          id: e.id,
          term: e.term,
          assessment: e.assessment,
          markFormatted: `${e.mark}/${e.max_mark}`,
        })),
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));

  return (
    <div>
      <div className="mb-6">
        <GradeForm />
      </div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Year 1 Semester 1</h2>
      <GradeList groups={groups} />
    </div>
  );
}
