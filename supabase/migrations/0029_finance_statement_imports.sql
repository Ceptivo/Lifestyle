-- Bank-statement imports (Nedbank PDF -> transactions), plus a review/flag
-- workflow for anything the parser couldn't confidently categorize.

create table finance_statement_imports (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references finance_accounts(id) on delete set null,
  file_name text,
  bank_name text default 'Nedbank',
  account_number text,
  statement_period_start date,
  statement_period_end date,
  opening_balance numeric,
  closing_balance numeric,
  total_credits numeric,
  total_debits numeric,
  total_fees numeric,
  interest_rate numeric,
  transactions_count int not null default 0,
  flagged_count int not null default 0,
  reconciled boolean not null default false,
  raw_text text not null,
  imported_at timestamptz not null default now()
);

alter table finance_accounts add column bank_account_number text;

alter table finance_transactions add column needs_review boolean not null default false;
alter table finance_transactions add column review_note text;
alter table finance_transactions add column balance_after numeric;
alter table finance_transactions add column bank_reference text;
alter table finance_transactions add column import_id uuid references finance_statement_imports(id) on delete set null;

create index finance_transactions_import_id_idx on finance_transactions(import_id);
create index finance_transactions_needs_review_idx on finance_transactions(needs_review);

alter table finance_statement_imports enable row level security;

-- Confirmed with the user: wipe all existing transactions so the app starts
-- fresh with statement-imported data only. Accounts, budgets, goals, and
-- subscriptions are intentionally left untouched.
delete from finance_transactions;
