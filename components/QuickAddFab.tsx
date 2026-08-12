"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Fuel, Dumbbell, BellRing, X } from "lucide-react";
import { addFuelLog } from "@/app/actions/vehicle";
import { addActivity } from "@/app/actions/health";
import { addReminder } from "@/app/actions/reminders";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { todayLocalDate } from "@/lib/format";
import { cn } from "@/lib/cn";

type Vehicle = { id: string; name: string };
type SheetKey = "fuel" | "training" | "reminder";

const ACTIONS: { key: SheetKey; label: string; icon: typeof Fuel; dx: number; dy: number }[] = [
  { key: "reminder", label: "Reminder", icon: BellRing, dx: -66, dy: -38 },
  { key: "training", label: "Log training", icon: Dumbbell, dx: 0, dy: -76 },
  { key: "fuel", label: "Fuel fill-up", icon: Fuel, dx: 66, dy: -38 },
];

const ACTIVITY_TYPES = ["Run", "Strength", "Hyrox", "Cycling", "Swim", "Other"];

export function QuickAddFab({ vehicles }: { vehicles: Vehicle[] }) {
  const [fanOpen, setFanOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetKey | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function closeAll() {
    setFanOpen(false);
    setSheet(null);
  }

  function submit(action: (formData: FormData) => Promise<unknown>) {
    return (formData: FormData) => {
      startTransition(async () => {
        await action(formData);
        formRef.current?.reset();
        closeAll();
        router.refresh();
      });
    };
  }

  return (
    <>
      {(fanOpen || sheet) && (
        <button
          type="button"
          aria-label="Close quick add"
          onClick={closeAll}
          className="fixed inset-0 z-20 bg-ink/40"
        />
      )}

      <div className="relative -mt-8 h-14 w-14 shrink-0">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              aria-label={action.label}
              onClick={() => {
                setFanOpen(false);
                setSheet(action.key);
              }}
              style={{
                transitionDelay: fanOpen ? `${i * 40}ms` : "0ms",
                transform: fanOpen ? `translate(${action.dx}px, ${action.dy}px) scale(1)` : "translate(0, 0) scale(0)",
              }}
              className={cn(
                "absolute inset-0 z-30 flex flex-col items-center justify-center gap-0.5 rounded-full bg-paper text-charcoal shadow-lg transition-all duration-200 ease-out",
                !fanOpen && "pointer-events-none opacity-0",
                fanOpen && "opacity-100"
              )}
            >
              <Icon size={17} className="text-pink-dark" />
              <span className="text-[8px] font-medium leading-none text-charcoal-soft">{action.label.split(" ")[0]}</span>
            </button>
          );
        })}

        <button
          type="button"
          aria-label="Quick add"
          aria-expanded={fanOpen}
          onClick={() => setFanOpen((o) => !o)}
          className="absolute inset-0 z-30 flex items-center justify-center rounded-full bg-pink text-ink shadow-lg transition-transform active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} className={cn("transition-transform duration-200", fanOpen && "rotate-45")} />
        </button>
      </div>

      {sheet && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-6">
          <form
            ref={formRef}
            action={submit(sheet === "fuel" ? addFuelLog : sheet === "training" ? addActivity : addReminder)}
            className="w-full max-w-md space-y-3 rounded-3xl border border-border bg-paper p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-charcoal">
                {sheet === "fuel" && "Log a fill-up"}
                {sheet === "training" && "Log training activity"}
                {sheet === "reminder" && "New reminder"}
              </p>
              <button type="button" onClick={closeAll} aria-label="Close" className="p-1 text-charcoal-soft hover:text-charcoal">
                <X size={18} />
              </button>
            </div>

            {sheet === "fuel" &&
              (vehicles.length === 0 ? (
                <p className="text-sm text-charcoal-soft">
                  Add a vehicle first from the{" "}
                  <a href="/vehicle" className="text-pink-dark underline">
                    Vehicle
                  </a>{" "}
                  section.
                </p>
              ) : (
                <>
                  {vehicles.length > 1 ? (
                    <Select name="vehicleId" defaultValue={vehicles[0].id} required>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <input type="hidden" name="vehicleId" value={vehicles[0].id} />
                  )}
                  <Input name="logDate" type="date" defaultValue={todayLocalDate()} required />
                  <div className="flex gap-2">
                    <Input name="liters" type="number" inputMode="decimal" step="0.01" placeholder="Liters" className="flex-1" />
                    <Input name="cost" type="number" inputMode="decimal" step="0.01" placeholder="Cost" required className="flex-1" />
                  </div>
                  <Input name="odometerKm" type="number" inputMode="numeric" placeholder="Odometer (km, optional)" />
                </>
              ))}

            {sheet === "training" && (
              <>
                <Input name="title" placeholder="e.g. Morning run" required />
                <Select name="activityType" defaultValue="Run">
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
                <div className="flex gap-2">
                  <Input name="durationMinutes" type="number" inputMode="decimal" step="1" min="0" placeholder="Minutes" className="flex-1" />
                  <Input name="distanceKm" type="number" inputMode="decimal" step="0.01" min="0" placeholder="Km (optional)" className="flex-1" />
                </div>
                <Input name="performedOn" type="date" defaultValue={todayLocalDate()} required />
              </>
            )}

            {sheet === "reminder" && (
              <>
                <Input name="title" placeholder="Reminder title" required />
                <Select name="priority" defaultValue="medium">
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="urgent">Urgent</option>
                </Select>
                <div>
                  <Label htmlFor="quick-reminder-at">Remind me at (optional)</Label>
                  <Input id="quick-reminder-at" name="remindAt" type="datetime-local" />
                </div>
              </>
            )}

            {(sheet !== "fuel" || vehicles.length > 0) && (
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving…" : "Save"}
              </Button>
            )}
          </form>
        </div>
      )}
    </>
  );
}
