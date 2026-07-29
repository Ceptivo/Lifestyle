import { Trash2 } from "lucide-react";
import { deleteExam } from "@/app/actions/university";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type Exam = {
  id: string;
  subject: string;
  title: string;
  notes: string | null;
  icon: string;
  examDateFormatted: string;
  daysUntil: number;
  past: boolean;
};

export function ExamList({ exams }: { exams: Exam[] }) {
  if (!exams.length) {
    return <p className="text-center text-sm text-charcoal-soft">No upcoming tests or exams yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {exams.map((e) => (
        <li key={e.id}>
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                e.past ? "bg-cream text-charcoal-soft" : "bg-pink-soft text-pink-dark"
              )}
            >
              <Icon name={e.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words hyphens-auto text-sm font-medium text-charcoal">{e.title}</p>
              <p className="text-xs text-charcoal-soft">
                {e.subject} · {e.examDateFormatted}
                {!e.past && e.daysUntil <= 7 && (
                  <span className="font-semibold text-danger"> · {e.daysUntil === 0 ? "Today" : `${e.daysUntil}d left`}</span>
                )}
                {e.past && " · Past"}
              </p>
              {e.notes && <p className="mt-0.5 text-xs text-charcoal-soft">{e.notes}</p>}
            </div>
            <form action={deleteExam.bind(null, e.id)}>
              <button type="submit" aria-label="Delete exam" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
