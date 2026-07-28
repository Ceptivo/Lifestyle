"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import { addSkillSession, deleteSkillSession } from "@/app/actions/learning";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { todayLocalDate } from "@/lib/format";

export type SkillSession = { id: string; sessionDateFormatted: string; notes: string | null };
export type Skill = {
  id: string;
  name: string;
  icon: string;
  sessionCount: number;
  lastPracticedLabel: string;
  sessions: SkillSession[];
};

export function SkillCard({ skill }: { skill: Skill }) {
  const [expanded, setExpanded] = useState(false);
  const [logging, setLogging] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="px-4 py-3.5">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-center gap-3 text-left">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={skill.icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-charcoal">{skill.name}</p>
          <p className="text-xs text-charcoal-soft">
            {skill.sessionCount} session{skill.sessionCount === 1 ? "" : "s"} · {skill.lastPracticedLabel}
          </p>
        </div>
        {expanded ? <ChevronUp size={18} className="text-charcoal-soft" /> : <ChevronDown size={18} className="text-charcoal-soft" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {!logging ? (
            <Button onClick={() => setLogging(true)} variant="secondary" className="w-full">
              <Plus size={16} /> Log session
            </Button>
          ) : (
            <form
              action={(formData) => {
                startTransition(async () => {
                  await addSkillSession(skill.id, formData);
                  setLogging(false);
                });
              }}
              className="space-y-2 rounded-xl border border-border bg-cream p-3"
            >
              <Input name="sessionDate" type="date" defaultValue={todayLocalDate()} required />
              <Input name="notes" placeholder="What to improve (optional)" maxLength={200} />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? "Saving…" : "Save"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setLogging(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {skill.sessions.length === 0 ? (
            <p className="text-center text-xs text-charcoal-soft">No sessions logged yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {skill.sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-lg px-1 py-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-charcoal">{s.sessionDateFormatted}</p>
                    {s.notes && <p className="text-xs text-charcoal-soft">{s.notes}</p>}
                  </div>
                  <form action={deleteSkillSession.bind(null, s.id)}>
                    <button type="submit" aria-label="Delete session" className="shrink-0 rounded-full p-1 text-charcoal-soft hover:bg-paper hover:text-danger">
                      <Trash2 size={12} />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
