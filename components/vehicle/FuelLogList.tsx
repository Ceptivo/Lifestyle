import { Trash2 } from "lucide-react";
import { deleteFuelLog } from "@/app/actions/vehicle";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

export type FuelLog = {
  id: string;
  dateFormatted: string;
  odometerKm: number | null;
  liters: number | null;
  cost: number;
  fuelStation: string | null;
};

export function FuelLogList({ logs }: { logs: FuelLog[] }) {
  if (!logs.length) return <p className="text-center text-sm text-charcoal-soft">No fill-ups logged yet.</p>;

  return (
    <ul className="space-y-2">
      {logs.map((l) => (
        <li key={l.id}>
          <Card className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-charcoal">{formatCurrency(l.cost)}</p>
              <p className="text-xs text-charcoal-soft">
                {l.dateFormatted}
                {l.liters ? ` · ${l.liters}L` : ""}
                {l.odometerKm ? ` · ${l.odometerKm.toLocaleString()}km` : ""}
                {l.fuelStation ? ` · ${l.fuelStation}` : ""}
              </p>
            </div>
            <form action={deleteFuelLog.bind(null, l.id)}>
              <button type="submit" aria-label="Delete fill-up" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
                <Trash2 size={14} />
              </button>
            </form>
          </Card>
        </li>
      ))}
    </ul>
  );
}
