import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AssignmentForm, type ModuleOption } from "@/components/university/AssignmentForm";
import { AssignmentList, type Assignment, type AssignmentMonthGroup } from "@/components/university/AssignmentList";
import { formatDate, todayLocalDate } from "@/lib/format";
import { daysBetween } from "@/lib/social";
import { cn } from "@/lib/cn";

export const revalidate = 60;

// Short, filter-tab-friendly names for the full module names on record.
const MODULE_SHORT_LABELS: Record<string, string> = {
  ACBP5122: "Accounting",
  BMNG5122: "Business Management",
  MAKT5112: "Marketing",
  PMAC5112: "Economics",
};

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { module: moduleFilter } = await searchParams;
  const supabase = createClient();
  const [{ data: assignments }, { data: modules }] = await Promise.all([
    supabase.from("university_assignments").select("*").order("due_date"),
    supabase.from("university_modules").select("id, code, name").order("code"),
  ]);

  const today = todayLocalDate();
  const moduleOptions: ModuleOption[] = modules ?? [];
  const moduleById = new Map(moduleOptions.map((m) => [m.id, m]));

  const filterTabs = [
    { code: null, label: "General" },
    ...moduleOptions.map((m) => ({ code: m.code, label: MODULE_SHORT_LABELS[m.code] ?? m.code })),
  ];
  const activeFilter = filterTabs.some((t) => t.code === moduleFilter) ? moduleFilter ?? null : null;

  const rows: Assignment[] = (assignments ?? [])
    .filter((a) => {
      if (!activeFilter) return true;
      const mod = a.module_id ? moduleById.get(a.module_id) : null;
      return mod?.code === activeFilter;
    })
    .map((a) => {
      const mod = a.module_id ? moduleById.get(a.module_id) : null;
      return {
        id: a.id,
        title: a.title,
        moduleCode: mod?.code ?? null,
        moduleName: mod?.name ?? null,
        dueDate: a.due_date,
        dueDateFormatted: a.due_date ? formatDate(a.due_date) : null,
        dueTime: a.due_time,
        daysUntil: a.due_date ? daysBetween(today, a.due_date) : null,
        notes: a.notes,
        status: a.status,
        flagged: a.flagged,
        overdue: a.status !== "graded" && a.due_date != null && a.due_date < today,
      };
    });

  const byMonth = new Map<string, Assignment[]>();
  const tbc: Assignment[] = [];
  for (const a of rows) {
    if (!a.dueDate) {
      tbc.push(a);
      continue;
    }
    const monthKey = new Date(a.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bucket = byMonth.get(monthKey) ?? [];
    bucket.push(a);
    byMonth.set(monthKey, bucket);
  }

  const groups: AssignmentMonthGroup[] = [...byMonth.entries()].map(([month, monthAssignments]) => ({ month, assignments: monthAssignments }));
  if (tbc.length > 0) groups.push({ month: "TBC", assignments: tbc });

  return (
    <div>
      <div className="mb-6">
        <AssignmentForm modules={moduleOptions} />
      </div>

      <nav className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-hide">
        <ul className="flex w-max gap-1.5">
          {filterTabs.map((tab) => (
            <li key={tab.code ?? "general"}>
              <Link
                href={tab.code ? `/university/assignments?module=${tab.code}` : "/university/assignments"}
                className={cn(
                  "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeFilter === tab.code
                    ? "bg-pink text-ink font-semibold"
                    : "bg-paper text-charcoal-soft hover:bg-pink-soft hover:text-pink-dark"
                )}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <AssignmentList groups={groups} />
    </div>
  );
}
