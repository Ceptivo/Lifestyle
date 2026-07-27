export type FinanceType = "income" | "expense";
export type SubscriptionCycle = "weekly" | "monthly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type HealthSource = "manual" | "samsung_health";
export type GoalStatus = "planned" | "in_progress" | "done";

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
          subscription_id: string | null;
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
          subscription_id?: string | null;
          amount: number;
          description?: string | null;
          occurred_on?: string;
          created_at?: string;
        };
        Update: {
          type?: FinanceType;
          account_id?: string;
          category_id?: string;
          subscription_id?: string | null;
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
      finance_subscriptions: {
        Row: {
          id: string;
          name: string;
          icon: string;
          amount: number;
          cycle: SubscriptionCycle;
          account_id: string;
          category_id: string;
          next_due_date: string;
          status: SubscriptionStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string;
          amount: number;
          cycle?: SubscriptionCycle;
          account_id: string;
          category_id: string;
          next_due_date: string;
          status?: SubscriptionStatus;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string;
          amount?: number;
          cycle?: SubscriptionCycle;
          account_id?: string;
          category_id?: string;
          next_due_date?: string;
          status?: SubscriptionStatus;
        };
        Relationships: [];
      };
      health_races: {
        Row: {
          id: string;
          name: string;
          discipline: string;
          division: string | null;
          age_group: string | null;
          location: string | null;
          event_date: string;
          result_time: string | null;
          result_notes: string | null;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          discipline?: string;
          division?: string | null;
          age_group?: string | null;
          location?: string | null;
          event_date: string;
          result_time?: string | null;
          result_notes?: string | null;
          icon?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          discipline?: string;
          division?: string | null;
          age_group?: string | null;
          location?: string | null;
          event_date?: string;
          result_time?: string | null;
          result_notes?: string | null;
          icon?: string;
        };
        Relationships: [];
      };
      health_training_weeks: {
        Row: {
          id: string;
          week_start_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          week_start_date: string;
          created_at?: string;
        };
        Update: {
          week_start_date?: string;
        };
        Relationships: [];
      };
      health_training_plan_items: {
        Row: {
          id: string;
          week_id: string;
          day_of_week: number;
          title: string;
          description: string | null;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          week_id: string;
          day_of_week: number;
          title: string;
          description?: string | null;
          icon?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          icon?: string;
        };
        Relationships: [];
      };
      health_activities: {
        Row: {
          id: string;
          title: string;
          activity_type: string;
          performed_on: string;
          duration_minutes: number | null;
          distance_km: number | null;
          calories: number | null;
          source: HealthSource;
          external_id: string | null;
          notes: string | null;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          activity_type?: string;
          performed_on?: string;
          duration_minutes?: number | null;
          distance_km?: number | null;
          calories?: number | null;
          source?: HealthSource;
          external_id?: string | null;
          notes?: string | null;
          icon?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          activity_type?: string;
          performed_on?: string;
          duration_minutes?: number | null;
          distance_km?: number | null;
          calories?: number | null;
          notes?: string | null;
          icon?: string;
        };
        Relationships: [];
      };
      health_sleep_logs: {
        Row: {
          id: string;
          sleep_date: string;
          bedtime: string | null;
          wake_time: string | null;
          duration_hours: number | null;
          quality_rating: number | null;
          mood_next_day: number | null;
          energy_next_day: number | null;
          source: HealthSource;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sleep_date?: string;
          bedtime?: string | null;
          wake_time?: string | null;
          duration_hours?: number | null;
          quality_rating?: number | null;
          mood_next_day?: number | null;
          energy_next_day?: number | null;
          source?: HealthSource;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          sleep_date?: string;
          bedtime?: string | null;
          wake_time?: string | null;
          duration_hours?: number | null;
          quality_rating?: number | null;
          mood_next_day?: number | null;
          energy_next_day?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      health_journal_entries: {
        Row: {
          id: string;
          entry_date: string;
          symptom: string;
          severity: number;
          body_area: string | null;
          triggers: string | null;
          notes: string | null;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_date?: string;
          symptom: string;
          severity: number;
          body_area?: string | null;
          triggers?: string | null;
          notes?: string | null;
          icon?: string;
          created_at?: string;
        };
        Update: {
          entry_date?: string;
          symptom?: string;
          severity?: number;
          body_area?: string | null;
          triggers?: string | null;
          notes?: string | null;
          icon?: string;
        };
        Relationships: [];
      };
      social_people: {
        Row: {
          id: string;
          name: string;
          relationship_type: string;
          icon: string;
          interaction_target_count: number;
          interaction_period_days: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          relationship_type?: string;
          icon?: string;
          interaction_target_count?: number;
          interaction_period_days?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          relationship_type?: string;
          icon?: string;
          interaction_target_count?: number;
          interaction_period_days?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      social_interactions: {
        Row: {
          id: string;
          person_id: string;
          occurred_on: string;
          interaction_type: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          occurred_on?: string;
          interaction_type?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          occurred_on?: string;
          interaction_type?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      social_occasions: {
        Row: {
          id: string;
          person_id: string;
          label: string;
          occasion_date: string;
          recurring: boolean;
          gift_ideas: string | null;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          label: string;
          occasion_date: string;
          recurring?: boolean;
          gift_ideas?: string | null;
          icon?: string;
          created_at?: string;
        };
        Update: {
          label?: string;
          occasion_date?: string;
          recurring?: boolean;
          gift_ideas?: string | null;
          icon?: string;
        };
        Relationships: [];
      };
      social_shared_goals: {
        Row: {
          id: string;
          person_id: string | null;
          name: string;
          description: string | null;
          target_date: string | null;
          status: GoalStatus;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id?: string | null;
          name: string;
          description?: string | null;
          target_date?: string | null;
          status?: GoalStatus;
          icon?: string;
          created_at?: string;
        };
        Update: {
          person_id?: string | null;
          name?: string;
          description?: string | null;
          target_date?: string | null;
          status?: GoalStatus;
          icon?: string;
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
