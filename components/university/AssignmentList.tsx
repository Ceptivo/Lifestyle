"use client";

import { useState, useTransition } from "react";
import { Flag, Pencil, Trash2, X } from "lucide-react";
import { updateAssignmentStatus, toggleAssignmentFlag, deleteAssignment, updateAssignment } from "@/app/actions/university-calendar";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { AssignmentStatus } from "@/lib/types";

const STATUS_FLOW: Record<AssignmentStatus, AssignmentStatus> = {
  pending: "submitted",
  submitted: "graded",
  graded: "pending",
};

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  graded: "Graded",
};

const STATUS_CLASS: Record<AssignmentStatus, string> = {
  pending: "bg-cream text-charcoal-soft",
  submitted: "bg-pink-soft text-pink-dark",
  graded: "bg-emerald-500/15 text-emerald-600",
};

export type Assignment = {
  id: string;
  title: string;
  moduleCode: string | null;
  moduleName: string | null;
  dueDate: string | null;
  dueDateFormatted: string | null;
  dueTime: string | null;
  daysUntil: number | null;
  notes: string | null;
  status: AssignmentStatus;
  flagged: boolean;
  overdue: boolean;
};

export type AssignmentMonthGroup = { month: string; assignments: Assignment[] };

function pillLabel(assignment: Assignment): string {
  if (assignment.status !== "pending") return STATUS_LABEL[assignment.status];
  if (assignment.daysUntil == null) return "Pending";
  if (assignment.daysUntil < 0) return "Overdue";
  if (assignment.daysUntil === 0) return "Due today";
  if (assignment.daysUntil === 1) return "Due tomorrow";
  return `In ${assignment.daysUntil} days`;
}

function AssignmentEditForm({ assignment, onDone }: { assignment: Assignment; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updateAssignment(assignment.id, formData);
          onDone();
        });
      }}
      className="mt-2 space-y-2"
    >
      <Input name="title" defaultValue={assignment.title} required className="text-sm" />
      <div className="flex gap-2">
        <Input name="dueDate" type="date" defaultValue={assignment.dueDate ?? ""} className="flex-1 text-sm" />
        <Input name="dueTime" type="time" defaultValue={assignment.dueTime ?? ""} className="flex-1 text-sm" />
      </div>
      <Textarea name="notes" defaultValue={assignment.notes ?? ""} placeholder="Description (optional)" rows={2} className="text-sm" />
      <div className="flex gap-1.5">
        <Button type="submit" disabled={isPending} className="h-8 flex-1 px-3 py-1.5 text-xs">
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone} className="h-8 px-3 py-1.5 text-xs">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  return (
    <Card className={cn("flex items-start gap-3 px-4 py-3.5", assignment.flagged && "border-danger/40 bg-danger-soft")}>
      <div className="min-w-0 flex-1">
        <p className="break-words hyphens-auto text-sm font-medium text-charcoal">
          {assignment.title}
          {assignment.moduleName && <span className="font-normal text-charcoal-soft"> · {assignment.moduleName}</span>}
        </p>
        {assignment.moduleCode && <p className="text-[11px] font-medium text-charcoal-soft">Module Code: {assignment.moduleCode}</p>}
        {assignment.dueDateFormatted ? (
          <p className={cn("text-xs", assignment.overdue ? "font-semibold text-danger" : "text-charcoal-soft")}>
            Due {assignment.dueDateFormatted}
            {assignment.dueTime && ` · ${assignment.dueTime.slice(0, 5)}`}
            {assignment.overdue && " · overdue"}
          </p>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">TBC</p>
        )}
        {assignment.notes && <p className="mt-0.5 break-words text-xs text-charcoal-soft">{assignment.notes}</p>}

        {editing && <AssignmentEditForm assignment={assignment} onDone={() => setEditing(false)} />}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-label={editing ? "Cancel edit" : "Edit assignment"}
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            {editing ? <X size={14} /> : <Pencil size={13} />}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => toggleAssignmentFlag(assignment.id, !assignment.flagged))}
            aria-label={assignment.flagged ? "Unflag" : "Flag as important"}
            className={cn("rounded-full p-1.5 hover:bg-cream", assignment.flagged ? "text-danger" : "text-charcoal-soft")}
          >
            <Flag size={14} fill={assignment.flagged ? "currentColor" : "none"} />
          </button>
          <form action={deleteAssignment.bind(null, assignment.id)}>
            <button type="submit" aria-label="Delete assignment" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => updateAssignmentStatus(assignment.id, STATUS_FLOW[assignment.status]))}
          className={cn("shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", STATUS_CLASS[assignment.status])}
        >
          {pillLabel(assignment)}
        </button>
      </div>
    </Card>
  );
}

export function AssignmentList({ groups }: { groups: AssignmentMonthGroup[] }) {
  const hasAny = groups.some((g) => g.assignments.length > 0);
  if (!hasAny) {
    return <p className="text-center text-sm text-charcoal-soft">No assignments yet. Add your first one.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.month}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal-soft">{g.month}</h3>
          <ul className="space-y-2">
            {g.assignments.map((a) => (
              <li key={a.id}>
                <AssignmentRow assignment={a} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
