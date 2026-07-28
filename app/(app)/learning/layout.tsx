import { PageHeading } from "@/components/ui/PageHeading";
import { LearningSubNav } from "@/components/learning/LearningSubNav";

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Learning & Growth" subtitle="What you're reading and practicing." />
      <LearningSubNav />
      {children}
    </div>
  );
}
