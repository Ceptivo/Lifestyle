"use client";

import { useState } from "react";
import { Target, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { WorkGoalForm } from "@/components/work/WorkGoalForm";
import { WorkGoalList, type WorkGoal } from "@/components/work/WorkGoalList";

export function WorkGoalsPanel({ goals }: { goals: WorkGoal[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open work goals"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <Target size={20} />
      </button>

      <div
        className={cn("fixed inset-0 z-50 bg-black/50 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-paper p-5 shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Work goals"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-lg font-bold text-charcoal">Goals</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <WorkGoalForm />
        </div>
        <WorkGoalList goals={goals} />
      </div>
    </>
  );
}
