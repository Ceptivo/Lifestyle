"use client";

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
  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border bg-cream p-2">
        {ICON_KEYS.map((key) => {
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-label={key}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                active ? "bg-pink text-white" : "bg-paper text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
              )}
            >
              <Icon name={key} size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
