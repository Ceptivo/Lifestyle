"use client";

import { useRef, useTransition } from "react";
import { addSavingsProgress } from "@/app/actions/travel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function SavingsProgressForm({ tripId }: { tripId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addSavingsProgress(tripId, formData);
          formRef.current?.reset();
        });
      }}
      className="flex gap-2"
    >
      <Input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="Add funds" />
      <Button type="submit" variant="secondary" disabled={isPending}>
        Add
      </Button>
    </form>
  );
}
