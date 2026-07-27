import { PageHeading } from "@/components/ui/PageHeading";
import { HealthSubNav } from "@/components/health/HealthSubNav";

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Health" subtitle="Training, sleep, and how you're feeling." />
      <HealthSubNav />
      {children}
    </div>
  );
}
