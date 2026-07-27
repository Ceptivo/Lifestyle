import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COLUMNS = ["Date", "Symptom", "Severity (1-10)", "Body area", "Triggers", "Notes"];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = createClient();
  let query = supabase
    .from("health_journal_entries")
    .select("entry_date, symptom, severity, body_area, triggers, notes")
    .order("entry_date", { ascending: true });
  if (from) query = query.gte("entry_date", from);
  if (to) query = query.lte("entry_date", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((e) =>
    [e.entry_date, e.symptom, String(e.severity), e.body_area ?? "", e.triggers ?? "", e.notes ?? ""]
      .map(csvEscape)
      .join(",")
  );
  const csv = [COLUMNS.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="health-journal-export.csv"`,
    },
  });
}
