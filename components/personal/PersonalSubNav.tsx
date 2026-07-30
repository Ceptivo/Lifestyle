"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/personal", label: "Documents" },
  { href: "/personal/passwords", label: "Passwords" },
  { href: "/personal/checklist", label: "Checklist" },
];

export function PersonalSubNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-hide">
      <ul className="flex w-max gap-1.5">
        {items.map(({ href, label }) => {
          const active = href === "/personal" ? pathname === "/personal" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-pink text-ink font-semibold"
                    : "bg-paper text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
