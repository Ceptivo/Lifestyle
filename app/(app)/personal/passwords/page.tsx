import { createClient } from "@/lib/supabase/server";
import { CredentialForm } from "@/components/personal/CredentialForm";
import { CredentialList, type Credential } from "@/components/personal/CredentialList";

export const dynamic = "force-dynamic";

export default async function PasswordsPage() {
  const supabase = createClient();
  const { data: credentials } = await supabase
    .from("personal_credentials")
    .select("id, service_name, username, url, notes, icon")
    .order("service_name");

  const rows: Credential[] = (credentials ?? []).map((c) => ({
    id: c.id,
    serviceName: c.service_name,
    username: c.username,
    url: c.url,
    notes: c.notes,
    icon: c.icon,
  }));

  return (
    <div>
      <div className="mb-6">
        <CredentialForm />
      </div>
      <CredentialList credentials={rows} />
    </div>
  );
}
