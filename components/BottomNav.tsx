"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/finance", label: "Finance", icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom sticky bottom-0 z-10 px-4 pb-3">
      <div className="relative mx-auto flex max-w-3xl items-center justify-around rounded-full border border-border bg-paper px-2 py-2 shadow-lg">
        {items.slice(0, 1).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
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

        <Link
          href="/finance/transactions"
          aria-label="Add transaction"
          className="-mt-8 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink text-ink shadow-lg transition-transform active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </Link>

        {items.slice(1).map(({ href, label, icon: Icon }) => {
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
    </nav>
  );
}
