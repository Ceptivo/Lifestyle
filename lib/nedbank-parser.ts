// Parses the plain text extracted from a Nedbank PDF statement (via
// pdf-parse's getText(), which tab-separates cells on the same visual row)
// into statement metadata + individual transactions.
//
// Transaction rows only ever carry one amount (whichever of Fees/Debits/
// Credits was populated), so direction (income vs expense) is derived from
// the running balance delta rather than column position — this also gives a
// free integrity check: if the parsed amount doesn't match the balance
// delta, something about that row didn't parse cleanly and it gets flagged.

export type ParsedTransaction = {
  date: string; // ISO YYYY-MM-DD
  description: string;
  amount: number; // always positive
  type: "income" | "expense";
  balanceAfter: number;
  isFee: boolean;
  bankReference: string | null;
  needsReview: boolean;
  reviewReason: string | null;
};

export type ParsedStatement = {
  accountNumber: string | null;
  accountType: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  openingBalance: number | null;
  closingBalance: number | null;
  totalCredits: number | null;
  totalDebits: number | null;
  totalFees: number | null;
  interestRate: number | null;
  transactions: ParsedTransaction[];
  reconciled: boolean;
  computedClosingBalance: number | null;
};

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const TRAN_REF_RE = /^\d{5,7}$/;

function ddmmyyyyToIso(d: string): string {
  const [day, month, year] = d.split("/");
  return `${year}-${month}-${day}`;
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[R\s*]/g, "").replace(/,/g, "");
  return Math.round(parseFloat(cleaned) * 100) / 100;
}

function splitCells(line: string): string[] {
  return line
    .split("\t")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

export function parseNedbankStatementText(text: string): ParsedStatement {
  const lines = text.split("\n").map((l) => l.trim());

  let accountNumber: string | null = null;
  let accountType: string | null = null;
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  let openingBalance: number | null = null;
  let closingBalance: number | null = null;
  let totalCredits: number | null = null;
  let totalDebits: number | null = null;
  let totalFees: number | null = null;
  let interestRate: number | null = null;

  for (const line of lines) {
    const cells = splitCells(line);
    if (cells[0] === "Account type" && cells[1] === "Account number") continue;
    if (cells[0] === "Statement period:" && cells[1]) {
      const [start, end] = cells[1].split(/[–-]/).map((s) => s.trim());
      if (start && DATE_RE.test(start)) periodStart = ddmmyyyyToIso(start);
      if (end && DATE_RE.test(end)) periodEnd = ddmmyyyyToIso(end);
    }
    if (cells[0] === "Opening balance" && cells[1]?.startsWith("R")) openingBalance = parseAmount(cells[1]);
    if (cells[0] === "Closing balance" && cells[1]?.startsWith("R")) closingBalance = parseAmount(cells[1]);
    if (cells[0] === "Funds received/Credits" && cells[1]) totalCredits = parseAmount(cells[1]);
    if (cells[0] === "Funds used/Debits" && cells[1]) totalDebits = parseAmount(cells[1]);
    if (cells[0] === "Bank charge(s) (total)" && cells[1]) totalFees = parseAmount(cells[1]);
    if (cells[0] === "Annual credit interest rate" && cells[1]) interestRate = parseFloat(cells[1].replace("%", ""));
    if (accountType === null && cells.length === 2 && /^\d{6,}$/.test(cells[1])) {
      accountType = cells[0];
      accountNumber = cells[1];
    }
  }

  const transactions: ParsedTransaction[] = [];
  let previousBalance: number | null = null;

  for (const line of lines) {
    const cells = splitCells(line);
    if (cells.length < 3) continue;

    let idx = 0;
    let bankReference: string | null = null;
    if (TRAN_REF_RE.test(cells[0])) {
      bankReference = cells[0];
      idx = 1;
    }
    if (!DATE_RE.test(cells[idx])) continue;

    const date = ddmmyyyyToIso(cells[idx]);
    const description = cells[idx + 1];
    if (!description) continue;

    // The opening-balance anchor row has no amount column — just date, label, balance.
    if (description === "Opening balance") {
      const balance = parseAmount(cells[idx + 2]);
      if (Number.isNaN(balance)) continue;
      previousBalance = balance;
      if (openingBalance == null) openingBalance = balance;
      continue;
    }

    const amountRaw = cells[idx + 2];
    const balanceRaw = cells[idx + 3];
    if (amountRaw == null || balanceRaw == null) continue;

    const balanceAfter = parseAmount(balanceRaw);
    if (Number.isNaN(balanceAfter)) continue;

    const rowAmount = parseAmount(amountRaw);
    const isFee = amountRaw.includes("*");

    if (previousBalance == null) {
      // No opening-balance anchor seen yet — can't determine direction confidently.
      transactions.push({
        date,
        description,
        amount: Math.abs(rowAmount),
        type: rowAmount >= 0 ? "income" : "expense",
        balanceAfter,
        isFee,
        bankReference,
        needsReview: true,
        reviewReason: "No opening balance found before this row — direction may be wrong.",
      });
      previousBalance = balanceAfter;
      continue;
    }

    const delta = Math.round((balanceAfter - previousBalance) * 100) / 100;
    previousBalance = balanceAfter;

    if (delta === 0) continue; // informational zero-impact line (e.g. a VAT note) — no transaction, nothing lost since raw text is stored separately

    const type: "income" | "expense" = delta > 0 ? "income" : "expense";
    const mismatch = Math.abs(Math.abs(delta) - rowAmount) > 0.02;

    transactions.push({
      date,
      description,
      amount: Math.abs(delta),
      type,
      balanceAfter,
      isFee,
      bankReference,
      needsReview: mismatch,
      reviewReason: mismatch ? `Parsed amount ${rowAmount.toFixed(2)} doesn't match the balance change ${delta.toFixed(2)} — check this row.` : null,
    });
  }

  const computedClosingBalance = transactions.length
    ? Math.round(
        (transactions.reduce((bal, t) => bal + (t.type === "income" ? t.amount : -t.amount), openingBalance ?? 0)) * 100
      ) / 100
    : openingBalance;

  const reconciled = closingBalance != null && computedClosingBalance != null && Math.abs(closingBalance - computedClosingBalance) < 0.02;

  return {
    accountNumber,
    accountType,
    periodStart,
    periodEnd,
    openingBalance,
    closingBalance,
    totalCredits,
    totalDebits,
    totalFees,
    interestRate,
    transactions,
    reconciled,
    computedClosingBalance,
  };
}
