"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/finance", label: "Overview" },
  { href: "/finance/transactions", label: "Transactions" },
  { href: "/finance/analytics", label: "Analytics" },
  { href: "/finance/budgets", label: "Budgets" },
  { href: "/finance/subscriptions", label: "Subscriptions" },
  { href: "/finance/goals", label: "Goals" },
  { href: "/finance/forecast", label: "Forecast" },
  { href: "/finance/accounts", label: "Accounts" },
  { href: "/finance/categories", label: "Categories" },
  { href: "/finance/profile", label: "Profile" },
];

export function FinanceSubNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 mb-6 overflow-x-auto px-4">
      <ul className="flex w-max gap-1.5">
        {items.map(({ href, label }) => {
          const active = href === "/finance" ? pathname === "/finance" : pathname.startsWith(href);
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
