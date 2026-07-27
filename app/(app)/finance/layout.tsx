import { PageHeading } from "@/components/ui/PageHeading";
import { FinanceSubNav } from "@/components/finance/FinanceSubNav";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Finance" subtitle="Track what comes in and what goes out." />
      <FinanceSubNav />
      {children}
    </div>
  );
}
