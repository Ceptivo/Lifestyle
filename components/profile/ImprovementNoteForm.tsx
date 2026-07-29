"use client";

import { useRef, useState, useTransition } from "react";
import { addImprovementNote } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

export function ImprovementNoteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addImprovementNote(formData);
          formRef.current?.reset();
          setContent("");
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <Textarea
        name="content"
        placeholder="What do you want to remember or improve on?"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <Button type="submit" disabled={isPending || !content.trim()} className="w-full">
        {isPending ? "Saving…" : "Save note"}
      </Button>
    </form>
  );
}
