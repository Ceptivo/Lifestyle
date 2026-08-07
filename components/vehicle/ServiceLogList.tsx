import { Trash2 } from "lucide-react";
import { deleteServiceLog } from "@/app/actions/vehicle";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

export type ServiceLog = {
  id: string;
  dateFormatted: string;
  odometerKm: number | null;
  description: string;
  cost: number | null;
  workshop: string | null;
};

export function ServiceLogList({ logs }: { logs: ServiceLog[] }) {
  if (!logs.length) return <p className="text-center text-sm text-charcoal-soft">No service records yet.</p>;

  return (
    <ul className="space-y-2">
      {logs.map((l) => (
        <li key={l.id}>
          <Card className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="break-words text-sm font-medium text-charcoal">{l.description}</p>
              <p className="text-xs text-charcoal-soft">
                {l.dateFormatted}
                {l.odometerKm ? ` · ${l.odometerKm.toLocaleString()}km` : ""}
                {l.workshop ? ` · ${l.workshop}` : ""}
                {l.cost != null ? ` · ${formatCurrency(l.cost)}` : ""}
              </p>
            </div>
            <form action={deleteServiceLog.bind(null, l.id)}>
              <button type="submit" aria-label="Delete record" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
