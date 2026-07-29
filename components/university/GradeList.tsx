import { Trash2 } from "lucide-react";
import { deleteGrade } from "@/app/actions/university";
import { Card } from "@/components/ui/Card";

export type GradeEntry = {
  id: string;
  term: string;
  assessment: string;
  markFormatted: string;
};

export type GradeSubjectGroup = {
  subject: string;
  averagePct: number;
  averagePctFormatted: string;
  entries: GradeEntry[];
};

export function GradeList({ groups }: { groups: GradeSubjectGroup[] }) {
  if (!groups.length) {
    return <p className="text-center text-sm text-charcoal-soft">No grades logged yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {groups.map((g) => (
        <li key={g.subject}>
          <Card className="px-4 py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-charcoal">{g.subject}</p>
              <span className="text-sm font-bold tabular-nums text-charcoal">{g.averagePctFormatted}</span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-pink" style={{ width: `${g.averagePct}%` }} />
            </div>
            <ul className="space-y-1.5">
              {g.entries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-charcoal">{e.assessment}</p>
                    <p className="truncate text-[10px] text-charcoal-soft">{e.term}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-semibold tabular-nums text-charcoal-soft">{e.markFormatted}</span>
                    <form action={deleteGrade.bind(null, e.id)}>
                      <button type="submit" aria-label="Delete grade" className="rounded-full p-1 text-charcoal-soft hover:bg-cream hover:text-danger">
                        <Trash2 size={12} />
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </li>
      ))}
    </ul>
  );
}
