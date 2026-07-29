"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type QuickLink = { href: string; label: string; icon: string };

export function FinanceMenuDrawer({ links }: { links: QuickLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open finance menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal-soft hover:bg-cream hover:text-charcoal"
      >
        <Menu size={22} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-72 max-w-[80vw] overflow-y-auto bg-paper p-5 shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Finance menu"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-lg font-bold text-charcoal">Finance</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 transition-colors hover:bg-cream"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Icon name={link.icon} size={16} />
                </span>
                <p className="min-w-0 truncate font-medium text-charcoal">{link.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
