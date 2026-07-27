import { Trash2, Moon } from "lucide-react";
import { deleteSleepLog } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";

type SleepLog = {
  id: string;
  sleepDateFormatted: string;
  durationLabel: string;
  ratingsLine: string;
  notes: string | null;
};

export function SleepLogList({ logs }: { logs: SleepLog[] }) {
  if (!logs.length) {
    return <p className="text-center text-sm text-charcoal-soft">No sleep logged yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li key={log.id}>
          <Card className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
              <Moon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-charcoal">
                {log.sleepDateFormatted} · {log.durationLabel}
              </p>
              <p className="text-xs text-charcoal-soft">{log.ratingsLine}</p>
              {log.notes && <p className="mt-0.5 text-xs text-charcoal-soft">{log.notes}</p>}
            </div>
            <form action={deleteSleepLog.bind(null, log.id)}>
              <button
                type="submit"
                aria-label="Delete sleep log"
                className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
