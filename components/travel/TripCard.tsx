import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export type TripCardData = {
  id: string;
  name: string;
  destination: string | null;
  icon: string;
  dateRangeLabel: string;
  countdownLabel: string;
  savingsPct: number;
  savingsLabel: string;
};

export function TripCard({ trip }: { trip: TripCardData }) {
  return (
    <Link href={`/travel/trips/${trip.id}`}>
      <Card className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
            <Icon name={trip.icon} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-charcoal">{trip.name}</p>
            <p className="truncate text-xs text-charcoal-soft">
              {trip.destination && `${trip.destination} · `}
              {trip.dateRangeLabel}
            </p>
          </div>
          <p className="shrink-0 text-xs font-semibold text-pink-dark">{trip.countdownLabel}</p>
        </div>
        {trip.savingsPct > 0 || trip.savingsLabel ? (
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-pink" style={{ width: `${trip.savingsPct}%` }} />
            </div>
            <p className="mt-1 text-xs text-charcoal-soft">{trip.savingsLabel}</p>
          </div>
        ) : null}
      </Card>
    </Link>
  );
}
