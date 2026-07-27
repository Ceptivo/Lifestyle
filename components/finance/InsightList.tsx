import { TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Insight } from "@/lib/insights";

const STATUS_STYLES = {
  good: { chip: "bg-pink-soft", text: "text-pink-dark", StatusIcon: TrendingUp, label: "On track" },
  warning: { chip: "bg-danger-soft", text: "text-danger", StatusIcon: AlertTriangle, label: "Needs attention" },
  tip: { chip: "bg-white/5", text: "text-charcoal-soft", StatusIcon: Lightbulb, label: "Worth a look" },
} as const;

export function InsightList({ insights }: { insights: Insight[] }) {
  if (!insights.length) {
    return (
      <Card>
        <p className="text-center text-sm text-charcoal-soft">
          Log a few weeks of transactions and I&rsquo;ll start surfacing personalized insights here.
        </p>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {insights.map((insight) => {
        const { chip, text, StatusIcon, label } = STATUS_STYLES[insight.status];
        return (
          <li key={insight.id}>
            <Card className="flex gap-3">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", chip, text)}>
                <Icon name={insight.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-charcoal">{insight.title}</p>
                <p className="mt-1 text-sm text-charcoal-soft">{insight.body}</p>
                <p className={cn("mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide", text)}>
                  <StatusIcon size={11} />
                  {label}
                </p>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
