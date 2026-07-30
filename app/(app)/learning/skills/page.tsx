import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "@/components/learning/CourseForm";
import { CourseCard, type Course } from "@/components/learning/CourseCard";

export const revalidate = 60;

export default async function SkillsPage() {
  const supabase = createClient();
  const { data: courses } = await supabase.from("learning_courses").select("*").order("created_at", { ascending: false });

  const rows: Course[] = (courses ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    progressPct: c.progress_pct,
    improvementNotes: c.improvement_notes,
    icon: c.icon,
  }));

  return (
    <div>
      <div className="mb-6">
        <CourseForm />
      </div>
      {rows.length === 0 ? (
        <p className="text-center text-sm text-charcoal-soft">No skills yet. Add one to start tracking progress.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li key={c.id}>
              <CourseCard course={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
