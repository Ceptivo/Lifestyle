import { PageHeading } from "@/components/ui/PageHeading";
import { EnvironmentSubNav } from "@/components/environment/EnvironmentSubNav";

export default function EnvironmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Home & Environment" subtitle="Keep the house running." />
      <EnvironmentSubNav />
      {children}
    </div>
  );
}
