"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X, Pencil } from "lucide-react";
import { addVehicle, updateVehicle } from "@/app/actions/vehicle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export type VehicleDetails = {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  licensePlate: string | null;
};

export function VehicleForm({ vehicle }: { vehicle?: VehicleDetails }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        {vehicle ? (
          <>
            <Pencil size={16} /> Edit vehicle details
          </>
        ) : (
          <>
            <Plus size={16} /> Add your vehicle
          </>
        )}
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          if (vehicle) {
            await updateVehicle(vehicle.id, formData);
          } else {
            await addVehicle(formData);
            formRef.current?.reset();
          }
          setOpen(false);
        });
      }}
      className="space-y-3 rounded-2xl border border-border bg-paper p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">{vehicle ? "Edit vehicle" : "New vehicle"}</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
          <X size={18} />
        </button>
      </div>

      <Input name="name" placeholder="Nickname (e.g. My Car)" defaultValue={vehicle?.name} required />
      <div className="flex gap-2">
        <Input name="make" placeholder="Make" defaultValue={vehicle?.make ?? ""} className="flex-1" />
        <Input name="model" placeholder="Model" defaultValue={vehicle?.model ?? ""} className="flex-1" />
      </div>
      <div className="flex gap-2">
        <Input name="year" type="number" placeholder="Year" defaultValue={vehicle?.year ?? ""} className="flex-1" />
        <Input name="licensePlate" placeholder="License plate" defaultValue={vehicle?.licensePlate ?? ""} className="flex-1" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save vehicle"}
      </Button>
    </form>
  );
}
