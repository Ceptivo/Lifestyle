"use client";

import { useState, useTransition } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { createEmailUpdate } from "@/app/actions/work";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { todayLocalDate } from "@/lib/format";

type Row = { id: string; text: string; depth: number; isHeader: boolean };

const MAX_DEPTH = 5;

// Common Gmail thread chrome that survives a plain-text paste — safe to drop automatically.
const NOISE_PATTERNS = [/^to\s+me$/i, /^[A-Za-z]{3,9},\s*[A-Za-z]{3,9}\s+\d{1,2},?\s*\d{1,2}:\d{2}\s*[AP]M$/i];

function parseRawText(raw: string): Row[] {
  const lines: { text: string; depth: number }[] = [];
  for (const rawLine of raw.replace(/\r\n/g, "\n").split("\n")) {
    const expanded = rawLine.replace(/\t/g, "    ");
    const trimmed = expanded.trim();
    if (!trimmed || NOISE_PATTERNS.some((p) => p.test(trimmed))) continue;
    const leading = expanded.length - expanded.trimStart().length;
    const depth = Math.min(MAX_DEPTH, Math.floor(leading / 2));
    const text = trimmed.replace(/^[•◦▪·‣∙\-*]\s+/, "");
    lines.push({ text, depth });
  }
  return lines.map((l, i) => {
    const next = lines[i + 1];
    return { id: `r${i}`, text: l.text, depth: l.depth, isHeader: !!next && next.depth > l.depth };
  });
}

// Non-header rows become checklist items; header rows just contribute a breadcrumb for their children.
function buildItems(rows: Row[]): { text: string; contextPath: string | null }[] {
  const stack: string[] = [];
  const items: { text: string; contextPath: string | null }[] = [];
  for (const row of rows) {
    if (!row.text.trim()) continue;
    if (row.isHeader) {
      stack[row.depth] = row.text.trim();
      stack.length = row.depth + 1;
    } else {
      const contextPath = stack.slice(0, row.depth).filter(Boolean).join(" › ");
      items.push({ text: row.text.trim(), contextPath: contextPath || null });
    }
  }
  return items;
}

let rowCounter = 0;
function newRowId() {
  rowCounter += 1;
  return `new-${rowCounter}`;
}

export function UpdateEmailForm() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"paste" | "review">("paste");
  const [subject, setSubject] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [receivedDate, setReceivedDate] = useState(todayLocalDate());
  const [rawText, setRawText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [isPending, startTransition] = useTransition();

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function addRow() {
    const lastDepth = rows.length ? rows[rows.length - 1].depth : 0;
    setRows((prev) => [...prev, { id: newRowId(), text: "", depth: lastDepth, isHeader: false }]);
  }

  function reset() {
    setStep("paste");
    setSubject("");
    setSourceName("");
    setReceivedDate(todayLocalDate());
    setRawText("");
    setRows([]);
    setOpen(false);
  }

  function handleCreate() {
    const items = buildItems(rows);
    if (items.length === 0) return;

    const fd = new FormData();
    fd.set("subject", subject);
    fd.set("sourceName", sourceName);
    fd.set("receivedDate", receivedDate);
    fd.set("rawText", rawText);
    fd.set("itemsJson", JSON.stringify(items));

    startTransition(async () => {
      await createEmailUpdate(fd);
      reset();
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Mail size={16} /> Paste an update email
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-paper p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">{step === "paste" ? "Paste update email" : "Review checklist"}</p>
        <button type="button" onClick={reset} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      {step === "paste" ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Input placeholder="From (e.g. Scott Allnatt)" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
          </div>
          <Input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
          <Textarea rows={10} placeholder="Paste the email text here…" value={rawText} onChange={(e) => setRawText(e.target.value)} />
          <Button
            type="button"
            onClick={() => {
              setRows(parseRawText(rawText));
              setStep("review");
            }}
            disabled={!rawText.trim()}
            className="w-full"
          >
            Parse into checklist
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs text-charcoal-soft">
            Fix anything that parsed wrong: use the arrows to change indent level, tap the{" "}
            <strong className="text-charcoal">I</strong>/<strong className="text-charcoal">H</strong> badge to mark a
            grouping line as a heading (no checkbox) instead of an item, or delete stray lines (like the sign-off).
          </p>
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-charcoal-soft">
              Nothing parsed — go back and check the pasted text.
            </p>
          ) : (
            <div className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-0.5">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center gap-1" style={{ marginLeft: row.depth * 14 }}>
                  <button
                    type="button"
                    onClick={() => updateRow(row.id, { depth: Math.max(0, row.depth - 1) })}
                    disabled={row.depth === 0}
                    aria-label="Outdent"
                    className="shrink-0 rounded-full p-1 text-charcoal-soft hover:bg-cream hover:text-charcoal disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRow(row.id, { depth: Math.min(MAX_DEPTH, row.depth + 1) })}
                    disabled={row.depth === MAX_DEPTH}
                    aria-label="Indent"
                    className="shrink-0 rounded-full p-1 text-charcoal-soft hover:bg-cream hover:text-charcoal disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <input
                    value={row.text}
                    onChange={(e) => updateRow(row.id, { text: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-cream px-2 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-pink"
                  />
                  <button
                    type="button"
                    onClick={() => updateRow(row.id, { isHeader: !row.isHeader })}
                    aria-label={row.isHeader ? "Marked as heading — tap to make it a checklist item" : "Marked as checklist item — tap to make it a heading"}
                    title={row.isHeader ? "Heading (not checkable)" : "Checklist item"}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      row.isHeader ? "bg-cream text-charcoal-soft" : "bg-pink-soft text-pink-dark"
                    )}
                  >
                    {row.isHeader ? "H" : "I"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove line"
                    className="shrink-0 rounded-full p-1 text-charcoal-soft hover:bg-cream hover:text-danger"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addRow}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-medium text-charcoal-soft hover:bg-cream"
          >
            <Plus size={14} /> Add line
          </button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep("paste")} className="flex-1">
              Back
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isPending} className="flex-1">
              {isPending ? "Creating…" : "Create checklist"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
