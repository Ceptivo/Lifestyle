export type FinanceType = "income" | "expense";

export interface Database {
  public: {
    Tables: {
      finance_accounts: {
        Row: {
          id: string;
          name: string;
          icon: string;
          starting_balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string;
          starting_balance?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string;
          starting_balance?: number;
        };
        Relationships: [];
      };
      finance_categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          type: FinanceType;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string;
          type: FinanceType;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string;
          type?: FinanceType;
        };
        Relationships: [];
      };
      finance_transactions: {
        Row: {
          id: string;
          type: FinanceType;
          account_id: string;
          category_id: string;
          amount: number;
          description: string | null;
          occurred_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: FinanceType;
          account_id: string;
          category_id: string;
          amount: number;
          description?: string | null;
          occurred_on?: string;
          created_at?: string;
        };
        Update: {
          type?: FinanceType;
          account_id?: string;
          category_id?: string;
          amount?: number;
          description?: string | null;
          occurred_on?: string;
        };
        Relationships: [];
      };
      finance_budgets: {
        Row: {
          id: string;
          category_id: string;
          monthly_limit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          monthly_limit: number;
          created_at?: string;
        };
        Update: {
          category_id?: string;
          monthly_limit?: number;
        };
        Relationships: [];
      };
      finance_goals: {
        Row: {
          id: string;
          name: string;
          icon: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string;
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
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
