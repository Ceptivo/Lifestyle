import { createClient } from "@/lib/supabase/server";
import { SkillForm } from "@/components/learning/SkillForm";
import { SkillCard, type Skill } from "@/components/learning/SkillCard";
import { formatDate, formatRelativeTime } from "@/lib/format";

export const revalidate = 60;

export default async function SkillsPage() {
  const supabase = createClient();
  const [{ data: skills }, { data: sessions }] = await Promise.all([
    supabase.from("learning_skills").select("*").order("name"),
    supabase.from("learning_skill_sessions").select("*").order("session_date", { ascending: false }),
  ]);

  const sessionsBySkill = new Map<string, typeof sessions>();
  for (const s of sessions ?? []) {
    const list = sessionsBySkill.get(s.skill_id) ?? [];
    list.push(s);
    sessionsBySkill.set(s.skill_id, list);
  }

  const rows: Skill[] = (skills ?? []).map((skill) => {
    const theirs = sessionsBySkill.get(skill.id) ?? [];
    const last = theirs[0];
    return {
      id: skill.id,
      name: skill.name,
      icon: skill.icon,
      sessionCount: theirs.length,
      lastPracticedLabel: last ? `last ${formatRelativeTime(last.session_date)}` : "never practiced",
      sessions: theirs.map((s) => ({ id: s.id, sessionDateFormatted: formatDate(s.session_date), notes: s.notes })),
    };
  });

  return (
    <div>
      <div className="mb-6">
        <SkillForm />
      </div>
      {rows.length === 0 ? (
        <p className="text-center text-sm text-charcoal-soft">No skills yet. Add one to start logging practice.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((s) => (
            <li key={s.id}>
              <SkillCard skill={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
