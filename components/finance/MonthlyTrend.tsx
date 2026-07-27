import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

type MonthTotal = { label: string; income: number; expense: number };

export function MonthlyTrend({ months }: { months: MonthTotal[] }) {
  const max = Math.max(1, ...months.map((m) => Math.max(m.income, m.expense)));

  return (
    <Card className="space-y-4">
      {months.map((m) => (
        <div key={m.label}>
          <div className="mb-1 flex items-center justify-between text-xs text-charcoal-soft">
            <span className="font-medium text-charcoal">{m.label}</span>
            <span>
              +{formatCurrency(m.income)} / -{formatCurrency(m.expense)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(m.income / max) * 100}%` }} />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-pink" style={{ width: `${(m.expense / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}
