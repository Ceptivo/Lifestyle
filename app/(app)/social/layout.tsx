import { PageHeading } from "@/components/ui/PageHeading";
import { SocialSubNav } from "@/components/social/SocialSubNav";

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Social" subtitle="Stay close to the people who matter." />
      <SocialSubNav />
      {children}
    </div>
  );
}
