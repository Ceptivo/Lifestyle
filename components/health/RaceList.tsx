"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil } from "lucide-react";
import { deleteRace, updateRaceResult } from "@/app/actions/health";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

type Race = {
  id: string;
  name: string;
  discipline: string;
  division: string | null;
  ageGroup: string | null;
  location: string | null;
  icon: string;
  eventDateFormatted: string;
  resultTime: string | null;
  resultNotes: string | null;
};

function RaceCard({ race, completed }: { race: Race; completed: boolean }) {
  const [editingResult, setEditingResult] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={race.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-charcoal">{race.name}</p>
          <p className="text-xs text-charcoal-soft">
            {race.eventDateFormatted}
            {race.location && ` · ${race.location}`}
          </p>
          <p className="mt-1 text-xs text-charcoal-soft">
            {race.discipline}
            {race.division && ` · ${race.division}`}
            {race.ageGroup && ` · Age ${race.ageGroup}`}
          </p>
          {completed && (race.resultTime || race.resultNotes) && !editingResult && (
            <div className="mt-2 rounded-xl bg-cream p-2.5">
              {race.resultTime && <p className="text-sm font-semibold tabular-nums text-charcoal">{race.resultTime}</p>}
              {race.resultNotes && <p className="mt-0.5 text-xs text-charcoal-soft">{race.resultNotes}</p>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {completed && (
            <button
              type="button"
              onClick={() => setEditingResult((v) => !v)}
              aria-label="Edit result"
              className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
            >
              <Pencil size={14} />
            </button>
          )}
          <form action={deleteRace.bind(null, race.id)}>
            <button
              type="submit"
              aria-label="Delete race"
              className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger"
            >
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>

      {completed && editingResult && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateRaceResult(race.id, formData);
              setEditingResult(false);
            });
          }}
          className="mt-3 space-y-2 rounded-xl border border-border bg-cream p-3"
        >
          <Input name="resultTime" placeholder="Finish time (e.g. 1:32:45)" defaultValue={race.resultTime ?? ""} />
          <Input name="resultNotes" placeholder="Notes" defaultValue={race.resultNotes ?? ""} />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Save result"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export function RaceList({ upcoming, completed }: { upcoming: Race[]; completed: Race[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-charcoal-soft">No upcoming races. Add one you&rsquo;re training for.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((r) => (
              <li key={r.id}>
                <RaceCard race={r} completed={false} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Completed</h3>
        {completed.length === 0 ? (
          <p className="text-sm text-charcoal-soft">No completed races yet.</p>
        ) : (
          <ul className="space-y-2">
            {completed.map((r) => (
              <li key={r.id}>
                <RaceCard race={r} completed={true} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
