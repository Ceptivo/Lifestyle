import { createClient } from "@/lib/supabase/server";
import { MaterialForm } from "@/components/university/MaterialForm";
import { MaterialList, type Material } from "@/components/university/MaterialList";

export const revalidate = 60;

export default async function StudyMaterialPage() {
  const supabase = createClient();
  const { data: materials } = await supabase
    .from("university_study_materials")
    .select("*")
    .order("created_at", { ascending: false });

  const rows: Material[] = (materials ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    subject: m.subject,
    notes: m.notes,
    url: m.url,
    icon: m.icon,
  }));

  return (
    <div>
      <div className="mb-6">
        <MaterialForm />
      </div>
      <MaterialList materials={rows} />
    </div>
  );
}
