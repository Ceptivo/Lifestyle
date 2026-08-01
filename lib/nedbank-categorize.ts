// Best-effort category matching for imported statement transactions, run
// against the user's real (existing) category list. Deliberately
// conservative: only well-known chains/providers get auto-categorized —
// anything ambiguous (small local businesses, payment-gateway-wrapped
// descriptions, unrecognized names) is left for the user to review rather
// than guessed at.

export type LiveCategory = { id: string; name: string; type: "income" | "expense" };

export type CategorizationResult = {
  categoryId: string | null;
  needsReview: boolean;
  reviewReason: string | null;
};

type Rule = { categoryNames: string[]; keywords: string[] };

const EXPENSE_RULES: Rule[] = [
  { categoryNames: ["Groceries"], keywords: ["SUPERSPAR", "KWIKSPAR", "SPAR ", "CHECKERS", "WOOLWORTHS", "PICK N PAY", "PNP ", "PNP CRP", "FAMILYSTORE", "USAVE"] },
  {
    categoryNames: ["Dining"],
    keywords: [
      "MCD ", "MCD WEST", "MCD GORDON", "MCDONALD", "KFC", "STEERS", "DEBONAIRS", "WIMPY", "ROCOMAMAS", "NANDO",
      "PIZZA", "SUSHI", "MILKY LANE", "KRISPY KREME", "ROMANSPIZZA", "TIAGOS", "SPICY TOUCH",
    ],
  },
  { categoryNames: ["Transport"], keywords: ["SHELL ", "BP ", "SASOL", "ENGEN", "AUTOZONE", "UBER", "BOLT"] },
  { categoryNames: ["Bank Fees"], keywords: ["WITHDRAWAL FEE", "INS FUNDS", "M/C IN"] },
  { categoryNames: ["Music"], keywords: ["SPOTIFY"] },
  { categoryNames: ["AI"], keywords: ["ANTHROPIC", "OPENAI", "CHATGPT", "CLAUDE"] },
  { categoryNames: ["Subscriptions"], keywords: ["GOOGLE ", "KINDLE", "NETFLIX", "DSTV", "SHOWMAX", "AMAZON PRIME", "APPLE.COM"] },
  { categoryNames: ["Utilities"], keywords: ["MTN ", "M#MTN", "VODACOM", "CELL C", "TELKOM"] },
  { categoryNames: ["Personal Care"], keywords: ["BARBER", "HAIRCUT", "HAICUT", "SALON"] },
  { categoryNames: ["Health"], keywords: ["CLICKS", "DISCHEM", "PHARMACY", "CLINIC"] },
];

const INCOME_RULES: Rule[] = [{ categoryNames: ["Income"], keywords: ["INTEREST", "SALARY", "SHELLEY RESIDENTIAL"] }];

// Generic nouns that match the short/no-digits "looks like a person" shape but aren't names.
const NON_NAME_WORDS = new Set(["movies", "movie", "rent", "refund", "payment", "deposit", "transfer", "loan", "cinema", "tickets"]);

function findCategory(names: string[], liveCategories: LiveCategory[], type: "income" | "expense"): string | null {
  const lowerNames = names.map((n) => n.toLowerCase());
  return liveCategories.find((c) => c.type === type && lowerNames.includes(c.name.toLowerCase()))?.id ?? null;
}

function matchRules(description: string, rules: Rule[], liveCategories: LiveCategory[], type: "income" | "expense"): string | null {
  const upper = description.toUpperCase();
  for (const rule of rules) {
    if (rule.keywords.some((kw) => upper.includes(kw))) {
      const id = findCategory(rule.categoryNames, liveCategories, type);
      if (id) return id;
    }
  }
  return null;
}

export function categorizeTransaction(
  description: string,
  type: "income" | "expense",
  isFee: boolean,
  liveCategories: LiveCategory[]
): CategorizationResult {
  if (isFee && type === "expense") {
    const feeId = findCategory(["Bank Fees"], liveCategories, "expense");
    if (feeId) return { categoryId: feeId, needsReview: false, reviewReason: null };
  }

  const rules = type === "income" ? INCOME_RULES : EXPENSE_RULES;
  const matched = matchRules(description, rules, liveCategories, type);
  if (matched) return { categoryId: matched, needsReview: false, reviewReason: null };

  if (type === "income") {
    // No digits/card-mask suffix and short — usually a person's name (e.g. "Mom", "Big J", "SR Allnatt").
    // Excludes common generic nouns that fit the same shape but aren't names (e.g. "Movies", "Rent").
    const words = description.trim().split(/\s+/);
    const looksLikeTransfer =
      !/\d/.test(description) && words.length <= 3 && !words.some((w) => NON_NAME_WORDS.has(w.toLowerCase()));
    if (looksLikeTransfer) {
      const transferId = findCategory(["Transfer"], liveCategories, "income");
      if (transferId) return { categoryId: transferId, needsReview: false, reviewReason: null };
    }
    return {
      categoryId: findCategory(["Income"], liveCategories, "income"),
      needsReview: true,
      reviewReason: "Couldn't confidently identify this income source — check the category.",
    };
  }

  return {
    categoryId: findCategory(["Other"], liveCategories, "expense"),
    needsReview: true,
    reviewReason: "Couldn't confidently identify this merchant — check the category.",
  };
}
