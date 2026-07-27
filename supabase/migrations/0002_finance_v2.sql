-- Lifestyle — Finance v2: accounts, custom categories, budgets, goals
--
-- Extends 0001_finance.sql. Categories move from a fixed enum to a
-- user-editable table (name + icon) so custom categories can be added, and
-- transactions now belong to an account. Existing rows (if any) are
-- backfilled onto a seeded "Cash" account and onto seeded categories that
-- match the old enum values, then the old column/enum are dropped.

create table public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'wallet',
  starting_balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'more-horizontal',
  type public.finance_type not null,
  created_at timestamptz not null default now()
);

insert into public.finance_accounts (name, icon) values ('Cash', 'wallet');

-- legacy_key is a scratch column used only to backfill finance_transactions
-- below; it's dropped again at the end of this migration.
alter table public.finance_categories add column legacy_key text;

insert into public.finance_categories (name, icon, type, legacy_key) values
  ('Income', 'wallet', 'income', 'income'),
  ('Housing', 'home', 'expense', 'housing'),
  ('Groceries', 'shopping-cart', 'expense', 'groceries'),
  ('Transport', 'car', 'expense', 'transport'),
  ('Utilities', 'zap', 'expense', 'utilities'),
  ('Dining', 'utensils-crossed', 'expense', 'dining'),
  ('Shopping', 'shopping-bag', 'expense', 'shopping'),
  ('Health', 'heart-pulse', 'expense', 'health'),
  ('Subscriptions', 'repeat', 'expense', 'subscriptions'),
  ('Savings', 'piggy-bank', 'expense', 'savings'),
  ('Other', 'more-horizontal', 'expense', 'other');

alter table public.finance_transactions
  add column account_id uuid references public.finance_accounts(id) on delete restrict,
  add column category_id uuid references public.finance_categories(id) on delete restrict;

update public.finance_transactions
  set account_id = (select id from public.finance_accounts order by created_at limit 1);

update public.finance_transactions t
  set category_id = fc.id
  from public.finance_categories fc
  where fc.legacy_key = t.category::text;

alter table public.finance_transactions
  alter column account_id set not null,
  alter column category_id set not null;

alter table public.finance_transactions drop column category;
drop type public.finance_category;

alter table public.finance_categories drop column legacy_key;

create index finance_transactions_account_idx on public.finance_transactions (account_id);
create index finance_transactions_category_idx on public.finance_transactions (category_id);

create table public.finance_budgets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null unique references public.finance_categories(id) on delete cascade,
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now()
);

create table public.finance_goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'target',
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date,
  created_at timestamptz not null default now()
);

alter table public.finance_accounts enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_budgets enable row level security;
alter table public.finance_goals enable row level security;
