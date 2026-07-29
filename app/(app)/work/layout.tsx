import { PageHeading } from "@/components/ui/PageHeading";
import { WorkSubNav } from "@/components/work/WorkSubNav";

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Work" subtitle="Tasks and notes." />
      <WorkSubNav />
      {children}
    </div>
  );
}
