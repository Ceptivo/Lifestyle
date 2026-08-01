"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Flag, CheckCircle2, AlertTriangle } from "lucide-react";
import { previewStatementImport, commitStatementImport, type ImportPreview, type PreviewTransaction } from "@/app/actions/finance-import";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { FinanceType } from "@/lib/types";

type Account = { id: string; name: string };
type Category = { id: string; name: string; type: FinanceType };

export function StatementImportForm({ accounts, categories }: { accounts: Account[]; categories: Category[] }) {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "review" | "done">("upload");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [transactions, setTransactions] = useState<PreviewTransaction[]>([]);
  const [accountChoice, setAccountChoice] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doneResult, setDoneResult] = useState<{ count: number; flagged: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const flaggedCount = transactions.filter((t) => t.needsReview).length;
  const visibleTransactions = showFlaggedOnly ? transactions.filter((t) => t.needsReview) : transactions;

  const sums = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [transactions]);

  function updateTransaction(key: string, patch: Partial<PreviewTransaction>) {
    setTransactions((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  }

  function handleParse() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF statement first.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("file", file);

    startTransition(async () => {
      try {
        const result = await previewStatementImport(fd);
        setPreview(result);
        setTransactions(result.transactions);
        setAccountChoice(result.matchedAccountId ?? "__new__");
        setNewAccountName(result.suggestedAccountName);
        setShowFlaggedOnly(result.transactions.some((t) => t.needsReview));
        setStep("review");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't read that PDF.");
      }
    });
  }

  function handleCommit() {
    if (!preview) return;
    if (transactions.some((t) => !t.categoryId)) {
      setError("Every transaction needs a category before importing — check the flagged ones.");
      return;
    }
    setError(null);

    const fd = new FormData();
    fd.set("accountId", accountChoice);
    fd.set("newAccountName", newAccountName);
    fd.set("fileName", preview.fileName);
    fd.set("rawText", preview.rawText);
    fd.set(
      "metaJson",
      JSON.stringify({
        accountNumber: preview.accountNumber,
        periodStart: preview.periodStart,
        periodEnd: preview.periodEnd,
        openingBalance: preview.openingBalance,
        closingBalance: preview.closingBalance,
        totalCredits: preview.totalCredits,
        totalDebits: preview.totalDebits,
        totalFees: preview.totalFees,
        interestRate: preview.interestRate,
        reconciled: preview.reconciled,
      })
    );
    fd.set("transactionsJson", JSON.stringify(transactions));

    startTransition(async () => {
      try {
        const result = await commitStatementImport(fd);
        setDoneResult(result);
        setStep("done");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save this import.");
      }
    });
  }

  function reset() {
    setStep("upload");
    setPreview(null);
    setTransactions([]);
    setAccountChoice("");
    setNewAccountName("");
    setError(null);
    setDoneResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (step === "done" && doneResult) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-paper p-5 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
        <p className="text-lg font-bold text-charcoal">Imported {doneResult.count} transactions</p>
        {doneResult.flagged > 0 && (
          <p className="text-sm text-charcoal-soft">
            {doneResult.flagged} of them are flagged for review — you&apos;ll find them under &quot;Needs review&quot; on the Transactions page.
          </p>
        )}
        <Button onClick={reset} className="w-full">
          Import another statement
        </Button>
      </div>
    );
  }

  if (step === "upload" || !preview) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-paper p-5">
        <p className="text-sm font-medium text-charcoal">Upload a Nedbank statement</p>
        <p className="text-xs text-charcoal-soft">
          Upload the PDF statement Nedbank emails you each month. Every transaction is parsed and cross-checked against the
          statement&apos;s own closing balance, so nothing gets silently dropped.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="w-full rounded-xl border border-dashed border-border bg-cream px-4 py-6 text-center text-sm text-charcoal-soft file:mr-3 file:rounded-full file:border-0 file:bg-pink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button onClick={handleParse} disabled={isPending} className="w-full">
          <Upload size={16} /> {isPending ? "Reading statement…" : "Parse statement"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-paper p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-charcoal">Review before importing</p>
          <button type="button" onClick={reset} aria-label="Cancel" className="p-1 text-charcoal-soft hover:text-charcoal">
            <X size={18} />
          </button>
        </div>

        <div
          className={cn(
            "mb-3 flex items-start gap-2 rounded-xl border p-3 text-xs",
            preview.reconciled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-orange-500/30 bg-orange-500/10 text-orange-600"
          )}
        >
          {preview.reconciled ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <p>
            {preview.reconciled
              ? "Reconciled — every parsed transaction adds up to exactly the statement's closing balance."
              : `Doesn't fully reconcile: computed closing balance ${formatCurrency(preview.computedClosingBalance ?? 0)} vs statement's ${formatCurrency(preview.closingBalance ?? 0)}. Double-check the flagged rows below.`}
          </p>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-cream px-3 py-2">
            <p className="text-charcoal-soft">Period</p>
            <p className="font-semibold text-charcoal">
              {preview.periodStart ? formatDate(preview.periodStart) : "?"} – {preview.periodEnd ? formatDate(preview.periodEnd) : "?"}
            </p>
          </div>
          <div className="rounded-xl bg-cream px-3 py-2">
            <p className="text-charcoal-soft">Transactions</p>
            <p className="font-semibold text-charcoal">
              {transactions.length} ({flaggedCount} flagged)
            </p>
          </div>
          <div className="rounded-xl bg-cream px-3 py-2">
            <p className="text-charcoal-soft">Income</p>
            <p className="font-semibold text-emerald-600">{formatCurrency(sums.income)}</p>
          </div>
          <div className="rounded-xl bg-cream px-3 py-2">
            <p className="text-charcoal-soft">Expenses</p>
            <p className="font-semibold text-danger">{formatCurrency(sums.expense)}</p>
          </div>
        </div>

        <div className="mb-1">
          <label className="mb-1.5 block text-sm font-medium text-charcoal-soft">Account</label>
          <Select value={accountChoice} onChange={(e) => setAccountChoice(e.target.value)}>
            <option value="__new__">+ Create new account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id === preview.matchedAccountId ? `${a.name} (matched by account number)` : a.name}
              </option>
            ))}
          </Select>
        </div>
        {accountChoice === "__new__" && (
          <Input className="mt-2" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="Account name" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFlaggedOnly(true)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            showFlaggedOnly ? "bg-pink text-ink" : "bg-cream text-charcoal-soft hover:text-charcoal"
          )}
        >
          Flagged only ({flaggedCount})
        </button>
        <button
          type="button"
          onClick={() => setShowFlaggedOnly(false)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            !showFlaggedOnly ? "bg-pink text-ink" : "bg-cream text-charcoal-soft hover:text-charcoal"
          )}
        >
          All ({transactions.length})
        </button>
      </div>

      <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-0.5">
        {visibleTransactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-charcoal-soft">
            Nothing flagged — everything parsed with a confident category.
          </p>
        ) : (
          visibleTransactions.map((t) => (
            <div key={t.key} className={cn("rounded-xl border p-3", t.needsReview ? "border-orange-500/30 bg-orange-500/5" : "border-border bg-paper")}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal-soft/70">{formatDate(t.date)}</p>
                  <p className="break-words text-sm font-medium text-charcoal">{t.description}</p>
                  {t.reviewReason && <p className="mt-0.5 text-xs text-orange-600">{t.reviewReason}</p>}
                </div>
                <p className={cn("shrink-0 text-sm font-semibold tabular-nums", t.type === "income" ? "text-emerald-600" : "text-danger")}>
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  className="flex-1"
                  value={t.categoryId ?? ""}
                  onChange={(e) => updateTransaction(t.key, { categoryId: e.target.value })}
                >
                  <option value="">Choose category…</option>
                  {categories
                    .filter((c) => c.type === t.type)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
                <button
                  type="button"
                  onClick={() => updateTransaction(t.key, { needsReview: !t.needsReview })}
                  aria-label={t.needsReview ? "Clear flag" : "Flag for review"}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    t.needsReview ? "bg-orange-500/15 text-orange-600" : "text-charcoal-soft hover:bg-cream hover:text-charcoal"
                  )}
                >
                  <Flag size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={reset} className="flex-1">
          Cancel
        </Button>
        <Button type="button" onClick={handleCommit} disabled={isPending} className="flex-1">
          {isPending ? "Importing…" : `Import ${transactions.length} transactions`}
        </Button>
      </div>
    </div>
  );
}
