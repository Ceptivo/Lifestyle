import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DOCUMENTS_BUCKET = "documents";
const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();

  const { data: file, error } = await supabase.from("personal_document_files").select("storage_path, file_name").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: signed, error: signError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(file.storage_path, SIGNED_URL_TTL_SECONDS, { download: file.file_name });
  if (signError || !signed) {
    return NextResponse.json({ error: signError?.message ?? "Could not generate download link" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
