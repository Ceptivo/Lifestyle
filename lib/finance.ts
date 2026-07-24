import {
  Wallet,
  Home as HomeIcon,
  ShoppingCart,
  Car,
  Zap,
  UtensilsCrossed,
  ShoppingBag,
  HeartPulse,
  Repeat,
  PiggyBank,
  MoreHorizontal,
} from "lucide-react";
import type { FinanceCategory, FinanceType } from "@/lib/types";

export const TRANSACTION_TYPES: FinanceType[] = ["income", "expense"];

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  "housing",
  "groceries",
  "transport",
  "utilities",
  "dining",
  "shopping",
  "health",
  "subscriptions",
  "savings",
  "other",
];

export const ALL_CATEGORIES: FinanceCategory[] = ["income", ...EXPENSE_CATEGORIES];

export const CATEGORY_LABEL: Record<FinanceCategory, string> = {
  income: "Income",
  housing: "Housing",
  groceries: "Groceries",
  transport: "Transport",
  utilities: "Utilities",
  dining: "Dining",
  shopping: "Shopping",
  health: "Health",
  subscriptions: "Subscriptions",
  savings: "Savings",
  other: "Other",
};

export const CATEGORY_ICON: Record<FinanceCategory, typeof Wallet> = {
  income: Wallet,
  housing: HomeIcon,
  groceries: ShoppingCart,
  transport: Car,
  utilities: Zap,
  dining: UtensilsCrossed,
  shopping: ShoppingBag,
  health: HeartPulse,
  subscriptions: Repeat,
  savings: PiggyBank,
  other: MoreHorizontal,
};
