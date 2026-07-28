import { PageHeading } from "@/components/ui/PageHeading";
import { TravelSubNav } from "@/components/travel/TravelSubNav";

export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Travel & Experiences" subtitle="Trips, packing, and the bucket list." />
      <TravelSubNav />
      {children}
    </div>
  );
}
