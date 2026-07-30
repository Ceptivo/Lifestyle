"use client";

import { useMemo, useState } from "react";
import { ActivityList, type ActivityItem } from "./ActivityList";
import { cn } from "@/lib/cn";

type LocationFilter = "any" | "indoor" | "outdoor";
type PhysicalFilter = "any" | "physical" | "non_physical";
type CostFilter = "any" | "cheap" | "expensive";

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal-soft">{label}</p>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              value === o.value ? "bg-pink text-ink" : "bg-paper text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActivityBrowser({ items }: { items: ActivityItem[] }) {
  const [location, setLocation] = useState<LocationFilter>("any");
  const [physical, setPhysical] = useState<PhysicalFilter>("any");
  const [cost, setCost] = useState<CostFilter>("any");

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (location === "any" || i.locationType === location) &&
          (physical === "any" || i.physicalType === physical) &&
          (cost === "any" || i.costTier === cost)
      ),
    [items, location, physical, cost]
  );

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-4 space-y-3 rounded-2xl border border-border bg-paper p-4">
          <FilterRow
            label="Where"
            value={location}
            onChange={setLocation}
            options={[
              { value: "any", label: "Any" },
              { value: "outdoor", label: "Outdoor" },
              { value: "indoor", label: "Indoor" },
            ]}
          />
          <FilterRow
            label="Type"
            value={physical}
            onChange={setPhysical}
            options={[
              { value: "any", label: "Any" },
              { value: "physical", label: "Physical" },
              { value: "non_physical", label: "Non-physical" },
            ]}
          />
          <FilterRow
            label="Cost"
            value={cost}
            onChange={setCost}
            options={[
              { value: "any", label: "Any" },
              { value: "cheap", label: "Cheap" },
              { value: "expensive", label: "Expensive" },
            ]}
          />
        </div>
      )}
      <ActivityList items={filtered} emptyMessage={items.length ? "Nothing matches these filters." : "No activities yet — add something to do."} />
    </div>
  );
}
