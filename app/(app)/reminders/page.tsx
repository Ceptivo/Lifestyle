import { createClient } from "@/lib/supabase/server";
import { PageHeading } from "@/components/ui/PageHeading";
import { ReminderForm } from "@/components/reminders/ReminderForm";
import { ReminderList, type Reminder, type ReminderPriorityGroup } from "@/components/reminders/ReminderList";
import { formatDateTime } from "@/lib/format";
import type { ReminderPriority } from "@/lib/types";

export const revalidate = 60;

const PRIORITY_ORDER: ReminderPriority[] = ["urgent", "medium", "low"];

export default async function RemindersPage() {
  const supabase = createClient();
  const { data: reminders } = await supabase.from("reminders").select("*").order("created_at", { ascending: false });

  const byPriority = new Map<ReminderPriority, Reminder[]>();
  for (const r of reminders ?? []) {
    const bucket = byPriority.get(r.priority) ?? [];
    bucket.push({
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      remindAt: r.remind_at,
      remindAtFormatted: r.remind_at ? formatDateTime(r.remind_at) : null,
      showOnHome: r.show_on_home,
      displayStart: r.home_display_start,
      displayEnd: r.home_display_end,
    });
    byPriority.set(r.priority, bucket);
  }

  const groups: ReminderPriorityGroup[] = PRIORITY_ORDER.filter((p) => (byPriority.get(p) ?? []).length > 0).map((priority) => ({
    priority,
    reminders: byPriority.get(priority)!,
  }));

  return (
    <div>
      <PageHeading title="Reminders" subtitle="Flag what matters, and pin it to Home if it's urgent." />
      <div className="mb-6">
        <ReminderForm />
      </div>
      <ReminderList groups={groups} />
    </div>
  );
}
