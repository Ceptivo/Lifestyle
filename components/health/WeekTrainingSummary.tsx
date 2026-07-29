import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { DAY_LABELS } from "@/lib/health";

export function WeekTrainingSummary({ sessionCount, trainedDays }: { sessionCount: number; trainedDays: Set<number> }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">This week</p>
        <p className="text-sm font-semibold text-charcoal">
          {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
        </p>
      </div>
      <div className="flex justify-between gap-1">
        {DAY_LABELS.map((label, dayOfWeek) => {
          const trained = trainedDays.has(dayOfWeek);
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
                  trained ? "bg-pink text-ink" : "bg-cream text-charcoal-soft"
                )}
              >
                {trained ? <Check size={16} /> : label.slice(0, 1)}
              </span>
              <span className="text-[10px] font-medium text-charcoal-soft">{label.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
