"use client";

import { useTransition } from "react";
import { Flag, Trash2 } from "lucide-react";
import { updateAssignmentStatus, toggleAssignmentFlag, deleteAssignment } from "@/app/actions/university-calendar";
import { Card } from "@/components/ui/Card";
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
  dueDateFormatted: string;
  notes: string | null;
  status: AssignmentStatus;
  flagged: boolean;
  overdue: boolean;
};

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className={cn("flex items-start gap-3 px-4 py-3.5", assignment.flagged && "border-danger/40 bg-danger-soft")}>
      <div className="min-w-0 flex-1">
        <p className="break-words hyphens-auto text-sm font-medium text-charcoal">
          {assignment.title}
          {assignment.moduleCode && <span className="font-normal text-charcoal-soft"> · {assignment.moduleCode}</span>}
        </p>
        <p className={cn("text-xs", assignment.overdue ? "font-semibold text-danger" : "text-charcoal-soft")}>
          Due {assignment.dueDateFormatted}
          {assignment.overdue && " · overdue"}
        </p>
        {assignment.notes && <p className="mt-0.5 text-xs text-charcoal-soft">{assignment.notes}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5">
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
          className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", STATUS_CLASS[assignment.status])}
        >
          {STATUS_LABEL[assignment.status]}
        </button>
      </div>
    </Card>
  );
}

export function AssignmentList({ assignments }: { assignments: Assignment[] }) {
  if (!assignments.length) {
    return <p className="text-center text-sm text-charcoal-soft">No assignments yet. Add your first one.</p>;
  }

  return (
    <ul className="space-y-2">
      {assignments.map((a) => (
        <li key={a.id}>
          <AssignmentRow assignment={a} />
        </li>
      ))}
    </ul>
  );
}
