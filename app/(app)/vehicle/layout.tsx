import { PageHeading } from "@/components/ui/PageHeading";
import { VehicleSubNav } from "@/components/vehicle/VehicleSubNav";

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeading title="Vehicle" subtitle="Fuel, maintenance, insurance, and service history." />
      <VehicleSubNav />
      {children}
    </div>
  );
}
