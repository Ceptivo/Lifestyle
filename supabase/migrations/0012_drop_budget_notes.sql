-- The freeform notes panel was replaced by a computed date-ordered budget
-- timeline (derived from finance_subscriptions + finance_budgets), so this
-- table is no longer used.
drop table if exists finance_budget_notes;
