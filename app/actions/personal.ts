"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { encryptSecret, decryptSecret } from "@/lib/vault-crypto";

const DOCUMENTS_BUCKET = "documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

// --- Documents -----------------------------------------------------------

export async function uploadDocument(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "other");
  const expiryDate = String(formData.get("expiryDate") ?? "");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name || files.length === 0) return;
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than the 10MB limit.`);
  }

  const supabase = createClient();
  const documentId = randomUUID();

  const { error: insertDocError } = await supabase.from("personal_documents").insert({
    id: documentId,
    name,
    category: category || "other",
    expiry_date: expiryDate || null,
  });
  if (insertDocError) throw new Error(insertDocError.message);

  const fileRows = [];
  for (const file of files) {
    const storagePath = `${documentId}/${randomUUID()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
    });
    if (uploadError) throw new Error(uploadError.message);

    fileRows.push({
      document_id: documentId,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      content_type: file.type || null,
    });
  }

  const { error: insertFilesError } = await supabase.from("personal_document_files").insert(fileRows);
  if (insertFilesError) throw new Error(insertFilesError.message);

  revalidatePath("/personal", "layout");
}

export async function deleteDocument(id: string) {
  const supabase = createClient();
  const { data: files, error: fetchError } = await supabase.from("personal_document_files").select("storage_path").eq("document_id", id);
  if (fetchError) throw new Error(fetchError.message);

  if (files && files.length > 0) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove(files.map((f) => f.storage_path));
  }

  const { error } = await supabase.from("personal_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/personal", "layout");
}

// --- Credentials -----------------------------------------------------------

export async function addCredential(formData: FormData) {
  const serviceName = String(formData.get("serviceName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!serviceName || !password) return;

  const supabase = createClient();
  const { error } = await supabase.from("personal_credentials").insert({
    service_name: serviceName,
    username: username || null,
    encrypted_password: encryptSecret(password),
    url: url || null,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/personal", "layout");
}

export async function revealCredential(id: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.from("personal_credentials").select("encrypted_password").eq("id", id).single();
  if (error) throw new Error(error.message);

  return decryptSecret(data.encrypted_password);
}

export async function deleteCredential(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("personal_credentials").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/personal", "layout");
}

// --- Admin checklist ---------------------------------------------------------

export async function addAdminTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  const recurring = formData.get("recurring") === "on";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title || !dueDate) return;

  const supabase = createClient();
  const { error } = await supabase.from("personal_admin_tasks").insert({
    title,
    category: category || "other",
    due_date: dueDate,
    recurring,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/personal", "layout");
}

export async function markAdminTaskDone(id: string) {
  const supabase = createClient();
  const { data: task, error: fetchError } = await supabase
    .from("personal_admin_tasks")
    .select("due_date, recurring")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const today = new Date().toISOString().slice(0, 10);

  if (task.recurring) {
    const { error } = await supabase
      .from("personal_admin_tasks")
      .update({ due_date: addYears(task.due_date, 1), last_completed_date: today })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("personal_admin_tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/personal", "layout");
}

export async function deleteAdminTask(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("personal_admin_tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/personal", "layout");
}
