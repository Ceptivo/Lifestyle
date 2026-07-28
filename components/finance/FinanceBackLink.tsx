import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function FinanceBackLink({
  href = "/finance",
  label = "Back to Finance",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-charcoal-soft hover:text-charcoal"
    >
      <ChevronLeft size={16} />
      {label}
    </Link>
  );
}
