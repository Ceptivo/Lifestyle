"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ICON_KEYS } from "@/lib/icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function IconPicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-charcoal-soft transition-colors hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-pink"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-soft text-pink-dark">
          <Icon name={value} size={14} />
        </span>
        <span className="flex-1 text-left">Select icon</span>
        <ChevronDown size={16} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-2 grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border bg-cream p-2">
          {ICON_KEYS.map((key) => {
            const active = key === value;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                aria-label={key}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-pink text-ink" : "bg-paper text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
                )}
              >
                <Icon name={key} size={16} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
