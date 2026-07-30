import { createClient } from "@/lib/supabase/server";
import { UpdateEmailForm } from "@/components/work/UpdateEmailForm";
import {
  OpenItemsList,
  UncertainItemsList,
  ConfirmItemsList,
  LoggedItemsList,
  type UpdateItem,
} from "@/components/work/UpdateItemSections";
import { formatDateTime } from "@/lib/format";

export const revalidate = 0;

export default async function WorkUpdatesPage() {
  const supabase = createClient();
  const [{ data: updates }, { data: items }] = await Promise.all([
    supabase.from("work_email_updates").select("id, subject, source_name"),
    supabase.from("work_update_items").select("*").order("sort_order", { ascending: true }),
  ]);

  const updateById = new Map((updates ?? []).map((u) => [u.id, u]));

  const withStatus = (items ?? []).map((i) => {
    const update = updateById.get(i.update_id);
    const mapped: UpdateItem = {
      id: i.id,
      text: i.text,
      contextPath: i.context_path,
      questionNote: i.question_note,
      loggedAtFormatted: i.logged_at ? formatDateTime(i.logged_at) : null,
      subject: update?.subject ?? null,
      sourceName: update?.source_name ?? null,
    };
    return { status: i.status, mapped };
  });

  const byStatus = (status: string) => withStatus.filter((r) => r.status === status).map((r) => r.mapped);
  const pending = byStatus("pending");
  const uncertain = byStatus("uncertain");
  const confirmPending = byStatus("confirm_pending");
  const logged = byStatus("logged").reverse();

  return (
    <div className="space-y-6">
      <UpdateEmailForm />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-charcoal">Open items ({pending.length})</h2>
        <OpenItemsList items={pending} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-charcoal">Flagged — ask Scott ({uncertain.length})</h2>
        <UncertainItemsList items={uncertain} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-charcoal">Confirm updates ({confirmPending.length})</h2>
        <ConfirmItemsList items={confirmPending} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-charcoal">Log of improvements ({logged.length})</h2>
        <LoggedItemsList items={logged} />
      </div>
    </div>
  );
}
