import { createClient } from "@/lib/supabase/server";
import { LogBrowser, type DateGroup } from "@/components/work/LogBrowser";
import { type UpdateItem } from "@/components/work/UpdateItemSections";
import { formatDate, formatDateTime, formatDateHeading } from "@/lib/format";

export const revalidate = 0;

export default async function WorkLogPage() {
  const supabase = createClient();
  const [{ data: updates }, { data: items }] = await Promise.all([
    supabase.from("work_email_updates").select("id, received_date"),
    supabase.from("work_update_items").select("*").eq("status", "logged").order("logged_at", { ascending: false }),
  ]);

  const updateById = new Map((updates ?? []).map((u) => [u.id, u]));

  const logged: UpdateItem[] = (items ?? []).map((i) => {
    const update = updateById.get(i.update_id);
    return {
      id: i.id,
      text: i.text,
      contextPath: i.context_path,
      questionNote: i.question_note,
      loggedAtFormatted: i.logged_at ? formatDateTime(i.logged_at) : null,
      loggedDate: i.logged_at ? i.logged_at.slice(0, 10) : null,
      receivedDateFormatted: update?.received_date ? formatDate(update.received_date) : null,
    };
  });

  const groupsByDate = new Map<string, UpdateItem[]>();
  for (const item of logged) {
    const key = item.loggedDate ?? "unknown";
    if (!groupsByDate.has(key)) groupsByDate.set(key, []);
    groupsByDate.get(key)!.push(item);
  }
  const groups: DateGroup[] = Array.from(groupsByDate.entries()).map(([date, dateItems]) => ({
    date,
    heading: date === "unknown" ? "Unknown date" : formatDateHeading(date),
    items: dateItems,
  }));

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-charcoal">Log of improvements ({logged.length})</h2>
      <LogBrowser groups={groups} />
    </div>
  );
}
