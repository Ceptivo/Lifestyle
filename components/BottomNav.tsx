"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/finance", label: "Finance", icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom sticky bottom-0 z-10 bg-ink">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around px-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-pink" : "text-white/50 hover:text-white/80"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
