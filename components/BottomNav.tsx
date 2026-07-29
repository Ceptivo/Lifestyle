"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Wallet, HeartPulse, Plus, ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { AddTransactionForm } from "@/components/finance/AddTransactionForm";
import { cn } from "@/lib/cn";
import type { FinanceType } from "@/lib/types";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

const QUICK_ADDS: { key: string; label: string; icon: typeof ArrowDown; type: FinanceType }[] = [
  { key: "expense", label: "Expense", icon: ArrowDown, type: "expense" },
  { key: "income", label: "Income", icon: ArrowUp, type: "income" },
  { key: "other", label: "Other", icon: MoreHorizontal, type: "expense" },
];

type Account = { id: string; name: string };
type Category = { id: string; name: string; icon: string; type: FinanceType };

export function BottomNav({
  accounts = [],
  categories = [],
}: {
  accounts?: Account[];
  categories?: Category[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<FinanceType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <nav className="safe-bottom sticky bottom-0 z-10 px-4 pb-3">
      <div className="relative mx-auto max-w-3xl" ref={containerRef}>
        <div
          className={cn(
            "absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 flex-col-reverse items-center gap-3",
            !open && "pointer-events-none"
          )}
        >
          {QUICK_ADDS.map(({ key, label, icon: Icon, type }, i) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setOpen(false);
                setQuickAddType(type);
              }}
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              className="flex items-center gap-2.5 transition-all duration-200 ease-out"
              style={{
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "scale(1) translateY(0)" : "scale(0.4) translateY(12px)",
              }}
            >
              <span className="rounded-full border border-border bg-paper px-2.5 py-1 text-xs font-medium text-charcoal shadow-lg">
                {label}
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-pink shadow-lg">
                <Icon size={18} strokeWidth={2.5} />
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-around rounded-full border border-border bg-paper px-2 py-2 shadow-lg">
          {items.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
                  active ? "text-pink" : "text-charcoal-soft hover:text-charcoal"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            aria-label={open ? "Close quick add" : "Quick add"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="-mt-8 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink text-ink shadow-lg transition-transform active:scale-95"
          >
            <Plus size={26} strokeWidth={2.5} className={cn("transition-transform duration-200", open && "rotate-45")} />
          </button>

          {items.slice(2).map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
                  active ? "text-pink" : "text-charcoal-soft hover:text-charcoal"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {quickAddType && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setQuickAddType(null)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <AddTransactionForm
              accounts={accounts}
              categories={categories}
              initialOpen
              initialType={quickAddType}
              onClose={() => setQuickAddType(null)}
              onSaved={() => router.refresh()}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
