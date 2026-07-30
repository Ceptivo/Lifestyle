"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil } from "lucide-react";
import { updateCourseProgress, deleteCourse } from "@/app/actions/learning";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

export type Course = {
  id: string;
  name: string;
  description: string | null;
  progressPct: number;
  improvementNotes: string | null;
  icon: string;
};

export function CourseCard({ course }: { course: Course }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={course.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words hyphens-auto text-sm font-semibold text-charcoal">{course.name}</p>
          {course.description && <p className="text-xs text-charcoal-soft">{course.description}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-label="Update progress"
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <Pencil size={14} />
          </button>
          <form action={deleteCourse.bind(null, course.id)}>
            <button type="submit" aria-label="Delete skill" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-pink" style={{ width: `${course.progressPct}%` }} />
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-charcoal-soft">{course.progressPct}%</span>
      </div>

      {course.improvementNotes && !editing && (
        <p className="mt-2 text-xs text-charcoal-soft">
          <span className="font-semibold text-charcoal">To improve: </span>
          {course.improvementNotes}
        </p>
      )}

      {editing && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateCourseProgress(course.id, formData);
              setEditing(false);
            });
          }}
          className="mt-3 space-y-2 rounded-xl border border-border bg-cream p-3"
        >
          <Input name="progressPct" type="number" min="0" max="100" step="1" defaultValue={course.progressPct} placeholder="Progress %" />
          <Textarea
            name="improvementNotes"
            defaultValue={course.improvementNotes ?? ""}
            placeholder="Ways to master this / what to improve"
            rows={3}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Update"}
          </Button>
        </form>
      )}
    </Card>
  );
}
