import { PageHeading } from "@/components/ui/PageHeading";
import { PersonalSubNav } from "@/components/personal/PersonalSubNav";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Personal Admin" subtitle="Documents, passwords, and life admin." />
      <PersonalSubNav />
      {children}
    </div>
  );
}
