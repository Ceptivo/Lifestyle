import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type PersonCardData = {
  id: string;
  name: string;
  relationshipType: string;
  icon: string;
  pct: number;
  targetCount: number;
  periodDays: number;
  lastContactLabel: string;
  overdue: boolean;
};

export function PersonCard({ person }: { person: PersonCardData }) {
  return (
    <Link href={`/social/people/${person.id}`}>
      <Card className="px-4 py-3.5">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
            <Icon name={person.icon} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-words hyphens-auto text-sm font-semibold text-charcoal">{person.name}</p>
            <p className="break-words hyphens-auto text-xs capitalize text-charcoal-soft">{person.relationshipType}</p>
          </div>
          {person.overdue && (
            <span className="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger">
              Reach out
            </span>
          )}
        </div>

        <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-cream">
          <div
            className={cn("h-full rounded-full", person.overdue ? "bg-danger" : "bg-pink")}
            style={{ width: `${person.pct}%` }}
          />
        </div>
        <p className="text-xs text-charcoal-soft">
          {person.lastContactLabel} · goal: {person.targetCount}x / {person.periodDays}d
        </p>
      </Card>
    </Link>
  );
}
