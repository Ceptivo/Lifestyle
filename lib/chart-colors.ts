// Palette matched to the FinTrack dark-theme reference: the donut legend
// (Shopping/Food/Groceries/Health) and the 3-color "Within/Risk/Overspending"
// bar both read orange-red + lime-green + purple + teal + blue. Categorical
// identity, fixed order, never cycled — a 9th series folds into "Other."
export const CATEGORICAL: string[] = [
  "#ff7452", // orange-red
  "#c7f53b", // lime green (accent)
  "#9b7ef0", // purple
  "#35d0ba", // teal
  "#5b9bff", // blue
  "#eda100", // amber
  "#e87ba4", // rose
  "#7c8591", // slate
];

export const OTHER_SLOT = "#5c5c60"; // muted gray — the "Other" bucket, deliberately outside the identity palette

// Income/expense are a fixed semantic pair matching the reference's two-line
// charts (green "Budget"/"Income" line vs orange-red "Spent"/"Expenses" line).
export const INCOME_COLOR = "#c7f53b"; // --color-pink (accent)
export const EXPENSE_COLOR = "#ff7452"; // --color-danger
