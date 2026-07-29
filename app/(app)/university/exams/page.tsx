import { createClient } from "@/lib/supabase/server";
import { ExamForm } from "@/components/university/ExamForm";
import { ExamList, type Exam } from "@/components/university/ExamList";
import { formatDate, todayLocalDate } from "@/lib/format";
import { daysBetween } from "@/lib/social";

export const revalidate = 60;

export default async function ExamsPage() {
  const supabase = createClient();
  const today = todayLocalDate();
  const { data: exams } = await supabase.from("university_exams").select("*").order("exam_date", { ascending: true });

  const rows: Exam[] = (exams ?? []).map((e) => ({
    id: e.id,
    subject: e.subject,
    title: e.title,
    notes: e.notes,
    icon: e.icon,
    examDateFormatted: formatDate(e.exam_date),
    daysUntil: daysBetween(today, e.exam_date),
    past: e.exam_date < today,
  }));

  return (
    <div>
      <div className="mb-6">
        <ExamForm />
      </div>
      <ExamList exams={rows} />
    </div>
  );
}
