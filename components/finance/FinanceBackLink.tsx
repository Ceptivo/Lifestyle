import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function FinanceBackLink() {
  return (
    <Link
      href="/finance"
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-charcoal-soft hover:text-charcoal"
    >
      <ChevronLeft size={16} />
      Back to Finance
    </Link>
  );
}
