import { PageHeading } from "@/components/ui/PageHeading";
import { UniversitySubNav } from "@/components/university/UniversitySubNav";

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="University" subtitle="Study material, exams, and grades." />
      <UniversitySubNav />
      {children}
    </div>
  );
}
