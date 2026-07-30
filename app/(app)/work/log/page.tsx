import { createClient } from "@/lib/supabase/server";
import { LoggedItemsList, type UpdateItem } from "@/components/work/UpdateItemSections";
import { formatDate, formatDateTime } from "@/lib/format";

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
      receivedDateFormatted: update?.received_date ? formatDate(update.received_date) : null,
    };
  });

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-charcoal">Log of improvements ({logged.length})</h2>
      <LoggedItemsList items={logged} />
    </div>
  );
}
