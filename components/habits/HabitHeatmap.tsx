import { cn } from "@/lib/cn";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function intensityClass(ratio: number | undefined): string {
  if (ratio == null) return "bg-paper";
  if (ratio === 0) return "bg-cream";
  if (ratio < 0.5) return "bg-pink/30";
  if (ratio < 1) return "bg-pink/65";
  return "bg-pink";
}

export function HabitHeatmap({ monthStart, completionByDate }: { monthStart: string; completionByDate: Map<string, { done: number; total: number }> }) {
  const [y, m] = monthStart.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDow = (new Date(monthStart + "T00:00:00").getDay() + 6) % 7;

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = `${monthStart.slice(0, 8)}${String(day).padStart(2, "0")}`;
    const stat = completionByDate.get(date);
    return { date, day, ratio: stat && stat.total > 0 ? stat.done / stat.total : undefined, stat };
  });

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((d, i) => (
          <p key={i} className="text-center text-[10px] font-medium text-charcoal-soft">
            {d}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {cells.map((c) => (
          <div
            key={c.date}
            title={c.stat ? `${c.date}: ${c.stat.done}/${c.stat.total} habits done` : c.date}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-[10px] font-medium",
              intensityClass(c.ratio),
              c.ratio && c.ratio >= 0.5 ? "text-ink font-semibold" : "text-charcoal-soft"
            )}
          >
            {c.day}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-charcoal-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-cream" /> None
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-pink/30" /> Some
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-pink/65" /> Most
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-pink" /> All
        </span>
      </div>
    </div>
  );
}
