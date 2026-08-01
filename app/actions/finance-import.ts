"use server";

import { revalidatePath } from "next/cache";
import { PDFParse } from "pdf-parse";
import { createClient } from "@/lib/supabase/server";
import { parseNedbankStatementText } from "@/lib/nedbank-parser";
import { categorizeTransaction } from "@/lib/nedbank-categorize";
import type { FinanceType } from "@/lib/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export type PreviewTransaction = {
  key: string;
  date: string;
  description: string;
  amount: number;
  type: FinanceType;
  balanceAfter: number;
  isFee: boolean;
  bankReference: string | null;
  categoryId: string | null;
  needsReview: boolean;
  reviewReason: string | null;
};

export type ImportPreview = {
  fileName: string;
  rawText: string;
  accountNumber: string | null;
  accountType: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  openingBalance: number | null;
  closingBalance: number | null;
  computedClosingBalance: number | null;
  reconciled: boolean;
  totalCredits: number | null;
  totalDebits: number | null;
  totalFees: number | null;
  interestRate: number | null;
  matchedAccountId: string | null;
  suggestedAccountName: string;
  transactions: PreviewTransaction[];
};

export async function previewStatementImport(formData: FormData): Promise<ImportPreview> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a PDF statement to upload.");
  if (file.size > MAX_FILE_SIZE) throw new Error("That file is larger than the 15MB limit.");
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    throw new Error("Only PDF statements are supported right now.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });
  let text: string;
  try {
    const textResult = await parser.getText();
    text = textResult.text;
  } finally {
    await parser.destroy();
  }

  const parsed = parseNedbankStatementText(text);
  if (parsed.transactions.length === 0) {
    throw new Error("Couldn't find any transactions in that PDF — is it a Nedbank transaction statement?");
  }

  const supabase = createClient();
  const [{ data: categories }, { data: accounts }] = await Promise.all([
    supabase.from("finance_categories").select("id, name, type"),
    supabase.from("finance_accounts").select("id, name, bank_account_number"),
  ]);

  const liveCategories = categories ?? [];
  const matchedAccountId = parsed.accountNumber
    ? (accounts ?? []).find((a) => a.bank_account_number === parsed.accountNumber)?.id ?? null
    : null;

  const transactions: PreviewTransaction[] = parsed.transactions.map((t, i) => {
    const cat = categorizeTransaction(t.description, t.type, t.isFee, liveCategories);
    return {
      key: `t${i}`,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      balanceAfter: t.balanceAfter,
      isFee: t.isFee,
      bankReference: t.bankReference,
      categoryId: cat.categoryId,
      needsReview: t.needsReview || cat.needsReview,
      reviewReason: t.reviewReason ?? cat.reviewReason,
    };
  });

  return {
    fileName: file.name,
    rawText: text,
    accountNumber: parsed.accountNumber,
    accountType: parsed.accountType,
    periodStart: parsed.periodStart,
    periodEnd: parsed.periodEnd,
    openingBalance: parsed.openingBalance,
    closingBalance: parsed.closingBalance,
    computedClosingBalance: parsed.computedClosingBalance,
    reconciled: parsed.reconciled,
    totalCredits: parsed.totalCredits,
    totalDebits: parsed.totalDebits,
    totalFees: parsed.totalFees,
    interestRate: parsed.interestRate,
    matchedAccountId,
    suggestedAccountName: parsed.accountType ?? "Nedbank",
    transactions,
  };
}

export async function commitStatementImport(formData: FormData): Promise<{ importId: string; count: number; flagged: number }> {
  const accountId = String(formData.get("accountId") ?? "");
  const newAccountName = String(formData.get("newAccountName") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "");
  const rawText = String(formData.get("rawText") ?? "");
  const metaJson = String(formData.get("metaJson") ?? "{}");
  const transactionsJson = String(formData.get("transactionsJson") ?? "[]");

  const meta = JSON.parse(metaJson) as Pick<
    ImportPreview,
    "accountNumber" | "periodStart" | "periodEnd" | "openingBalance" | "closingBalance" | "totalCredits" | "totalDebits" | "totalFees" | "interestRate" | "reconciled"
  >;
  const transactions = JSON.parse(transactionsJson) as PreviewTransaction[];

  if (!rawText.trim()) throw new Error("Missing statement text — re-upload the PDF.");
  if (transactions.length === 0) throw new Error("No transactions to import.");
  if (transactions.some((t) => !t.categoryId)) throw new Error("Every transaction needs a category before importing.");

  const supabase = createClient();

  let resolvedAccountId = accountId;
  if (accountId === "__new__") {
    if (!newAccountName) throw new Error("Give the new account a name.");
    const { data: account, error } = await supabase
      .from("finance_accounts")
      .insert({
        name: newAccountName,
        icon: "landmark",
        starting_balance: meta.openingBalance ?? 0,
        bank_account_number: meta.accountNumber ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    resolvedAccountId = account.id;
  } else if (accountId && meta.accountNumber) {
    const { data: existing } = await supabase.from("finance_accounts").select("bank_account_number").eq("id", accountId).single();
    if (existing && !existing.bank_account_number) {
      await supabase.from("finance_accounts").update({ bank_account_number: meta.accountNumber }).eq("id", accountId);
    }
  }

  if (!resolvedAccountId) throw new Error("Choose or create an account for this statement.");

  const flaggedCount = transactions.filter((t) => t.needsReview).length;

  const { data: importRow, error: importError } = await supabase
    .from("finance_statement_imports")
    .insert({
      account_id: resolvedAccountId,
      file_name: fileName || null,
      account_number: meta.accountNumber ?? null,
      statement_period_start: meta.periodStart ?? null,
      statement_period_end: meta.periodEnd ?? null,
      opening_balance: meta.openingBalance ?? null,
      closing_balance: meta.closingBalance ?? null,
      total_credits: meta.totalCredits ?? null,
      total_debits: meta.totalDebits ?? null,
      total_fees: meta.totalFees ?? null,
      interest_rate: meta.interestRate ?? null,
      transactions_count: transactions.length,
      flagged_count: flaggedCount,
      reconciled: meta.reconciled ?? false,
      raw_text: rawText,
    })
    .select("id")
    .single();
  if (importError) throw new Error(importError.message);

  const { error: txError } = await supabase.from("finance_transactions").insert(
    transactions.map((t) => ({
      type: t.type,
      account_id: resolvedAccountId,
      category_id: t.categoryId!,
      amount: t.amount,
      description: t.description,
      occurred_on: t.date,
      needs_review: t.needsReview,
      review_note: t.reviewReason,
      balance_after: t.balanceAfter,
      bank_reference: t.bankReference,
      import_id: importRow.id,
    }))
  );
  if (txError) throw new Error(txError.message);

  revalidatePath("/finance", "layout");
  revalidatePath("/");

  return { importId: importRow.id, count: transactions.length, flagged: flaggedCount };
}

export async function resolveTransactionReview(id: string, formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("finance_transactions")
    .update({ category_id: categoryId, needs_review: false, review_note: null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finance", "layout");
  revalidatePath("/");
}
