"use client";

import { useState, useTransition } from "react";
import { Check, HelpCircle, Trash2 } from "lucide-react";
import { markItemDone, flagItemUncertain, resolveUncertainItem, confirmItem, deleteUpdateItem } from "@/app/actions/work";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export type UpdateItem = {
  id: string;
  text: string;
  contextPath: string | null;
  questionNote: string | null;
  loggedAtFormatted: string | null;
  loggedDate: string | null;
  receivedDateFormatted: string | null;
};

function ItemMeta({ item }: { item: UpdateItem }) {
  return (
    <>
      {item.receivedDateFormatted && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal-soft/70">{item.receivedDateFormatted}</p>
      )}
      {item.contextPath && <p className="text-xs text-charcoal-soft">{item.contextPath}</p>}
    </>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteUpdateItem.bind(null, id)}>
      <button type="submit" aria-label="Delete item" className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
        <Trash2 size={14} />
      </button>
    </form>
  );
}

function OpenItemRow({ item }: { item: UpdateItem }) {
  const [flagging, setFlagging] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <ItemMeta item={item} />
          <p className="break-words text-sm font-medium text-charcoal">{item.text}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => markItemDone(item.id))}
            aria-label="Mark done"
            className="rounded-full p-1.5 text-emerald-600 hover:bg-emerald-500/10"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={() => setFlagging((v) => !v)}
            aria-label="Flag as uncertain"
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-orange-500"
          >
            <HelpCircle size={16} />
          </button>
          <DeleteButton id={item.id} />
        </div>
      </div>
      {flagging && (
        <div className="mt-3 space-y-2 rounded-xl border border-border bg-cream p-3">
          <Input placeholder="What don't you understand? (optional)" value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
          <Button
            type="button"
            disabled={isPending}
            onClick={() => {
              const fd = new FormData();
              fd.set("note", note);
              startTransition(async () => {
                await flagItemUncertain(item.id, fd);
                setFlagging(false);
              });
            }}
            className="w-full"
          >
            Flag for Scott
          </Button>
        </div>
      )}
    </Card>
  );
}

function UncertainItemRow({ item }: { item: UpdateItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Card className="border-orange-500/30 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <ItemMeta item={item} />
          <p className="break-words text-sm font-medium text-charcoal">{item.text}</p>
          {item.questionNote && (
            <p className="mt-1 text-xs text-orange-600">
              <span className="font-semibold">Ask Scott: </span>
              {item.questionNote}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => resolveUncertainItem(item.id))}
            aria-label="Resolved, ready to confirm"
            className="rounded-full p-1.5 text-emerald-600 hover:bg-emerald-500/10"
          >
            <Check size={16} />
          </button>
          <DeleteButton id={item.id} />
        </div>
      </div>
    </Card>
  );
}

function ConfirmItemRow({ item }: { item: UpdateItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <ItemMeta item={item} />
          <p className="break-words text-sm font-medium text-charcoal">{item.text}</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => confirmItem(item.id))}
          aria-label="Confirm update"
          className="shrink-0 rounded-full p-1.5 text-emerald-600 hover:bg-emerald-500/10"
        >
          <Check size={16} />
        </button>
      </div>
    </Card>
  );
}

function LoggedItemRow({ item }: { item: UpdateItem }) {
  return (
    <Card className="px-4 py-3.5">
      <ItemMeta item={item} />
      <p className="break-words text-sm text-charcoal">{item.text}</p>
      {item.loggedAtFormatted && <p className="mt-1 text-xs text-charcoal-soft">{item.loggedAtFormatted}</p>}
    </Card>
  );
}

function Section({
  items,
  emptyMessage,
  row: Row,
  previewCount,
}: {
  items: UpdateItem[];
  emptyMessage: string;
  row: (props: { item: UpdateItem }) => React.ReactElement;
  previewCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!items.length) return <p className="text-center text-sm text-charcoal-soft">{emptyMessage}</p>;

  const truncated = !!previewCount && !expanded && items.length > previewCount;
  const visible = truncated ? items.slice(0, previewCount) : items;

  return (
    <>
      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.id}>
            <Row item={item} />
          </li>
        ))}
      </ul>
      {truncated && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 w-full rounded-xl border border-dashed border-border py-2 text-xs font-medium text-charcoal-soft hover:bg-cream"
        >
          View more ({items.length - previewCount!})
        </button>
      )}
    </>
  );
}

export function OpenItemsList({ items }: { items: UpdateItem[] }) {
  return <Section items={items} row={OpenItemRow} emptyMessage="No open items. Paste an update email to get started." previewCount={2} />;
}

export function UncertainItemsList({ items }: { items: UpdateItem[] }) {
  return (
    <Section
      items={items}
      row={UncertainItemRow}
      emptyMessage="Nothing flagged. Flag an item if you're not sure what it means."
      previewCount={2}
    />
  );
}

export function ConfirmItemsList({ items }: { items: UpdateItem[] }) {
  return <Section items={items} row={ConfirmItemRow} emptyMessage="Nothing waiting on confirmation." previewCount={2} />;
}

export function LoggedItemsList({ items }: { items: UpdateItem[] }) {
  return <Section items={items} row={LoggedItemRow} emptyMessage="No improvements logged yet." />;
}
