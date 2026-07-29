import { DAY_LABELS } from "@/lib/health";
import { cn } from "@/lib/cn";

function severityColor(severity: number | undefined): string | null {
  if (severity == null) return null;
  if (severity <= 3) return "bg-emerald-500";
  if (severity <= 6) return "bg-orange-500";
  return "bg-danger";
}

export function SymptomHeatmap({ monthStart, severityByDate }: { monthStart: string; severityByDate: Map<string, number> }) {
  const [y, m] = monthStart.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDow = (new Date(monthStart + "T00:00:00").getDay() + 6) % 7;

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = `${monthStart.slice(0, 8)}${String(day).padStart(2, "0")}`;
    return { date, day, severity: severityByDate.get(date) };
  });

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((d) => (
          <p key={d} className="text-center text-[10px] font-medium text-charcoal-soft">
            {d.slice(0, 1)}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {cells.map((c) => {
          const color = severityColor(c.severity);
          return (
            <div
              key={c.date}
              title={c.severity != null ? `${c.date}: severity ${c.severity}` : c.date}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-[10px] font-medium",
                color ?? "bg-paper",
                color ? "text-ink font-semibold" : "text-charcoal-soft"
              )}
            >
              {c.day}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-charcoal-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> 1–3
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> 4–6
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-danger" /> 7–10
        </span>
      </div>
    </div>
  );
}
