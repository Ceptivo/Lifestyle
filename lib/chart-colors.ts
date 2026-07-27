// Validated categorical palette (dataviz skill default), checked against this
// app's paper surface (#ffffff): fixed hue order, adjacent-pair CVD ΔE ≥ 8,
// normal-vision floor ≥ 15. Three slots (aqua/yellow/magenta) sit below 3:1
// contrast on white, so anywhere they're used carries a direct label — never
// color fill alone. Never reorder or cycle these; a 9th series folds into
// "Other" instead of generating a new hue.
export const CATEGORICAL: string[] = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export const OTHER_SLOT = "#898781"; // muted — the "Other" bucket, deliberately outside the identity palette

// Income/expense are a fixed semantic pair (not part of the categorical
// identity system) — same green/pink already used for amounts throughout
// the app (TransactionList, MonthlyTrend).
export const INCOME_COLOR = "#059669"; // emerald-600, matches text-emerald-600 used elsewhere
export const EXPENSE_COLOR = "#e34d78"; // --color-pink
