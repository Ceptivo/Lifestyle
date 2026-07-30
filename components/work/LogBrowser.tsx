"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { LoggedItemsList, type UpdateItem } from "@/components/work/UpdateItemSections";
import { Input } from "@/components/ui/Field";

export type DateGroup = { date: string; heading: string; items: UpdateItem[] };

export function LogBrowser({ groups }: { groups: DateGroup[] }) {
  const [searchDate, setSearchDate] = useState("");

  const filtered = useMemo(() => (searchDate ? groups.filter((g) => g.date === searchDate) : groups), [groups, searchDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          aria-label="Search log by date"
          className="flex-1"
        />
        {searchDate && (
          <button
            type="button"
            onClick={() => setSearchDate("")}
            aria-label="Clear date search"
            className="shrink-0 rounded-full p-2 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-charcoal-soft">
          {searchDate ? "No improvements logged on that date." : "No improvements logged yet."}
        </p>
      ) : (
        filtered.map((group) => (
          <div key={group.date}>
            <h3 className="mb-2 text-sm font-semibold text-charcoal">{group.heading}</h3>
            <LoggedItemsList items={group.items} />
          </div>
        ))
      )}
    </div>
  );
}
