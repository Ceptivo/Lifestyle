export type FinanceType = "income" | "expense";

export type FinanceCategory =
  | "income"
  | "housing"
  | "groceries"
  | "transport"
  | "utilities"
  | "dining"
  | "shopping"
  | "health"
  | "subscriptions"
  | "savings"
  | "other";

export interface Database {
  public: {
    Tables: {
      finance_transactions: {
        Row: {
          id: string;
          type: FinanceType;
          category: FinanceCategory;
          amount: number;
          description: string | null;
          occurred_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: FinanceType;
          category?: FinanceCategory;
          amount: number;
          description?: string | null;
          occurred_on?: string;
          created_at?: string;
        };
        Update: {
          type?: FinanceType;
          category?: FinanceCategory;
          amount?: number;
          description?: string | null;
          occurred_on?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
