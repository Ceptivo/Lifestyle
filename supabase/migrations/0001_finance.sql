-- Lifestyle — Finance subsection
--
-- Single-user app: access is gated by a PIN at the Next.js layer (see
-- proxy.ts / app/actions/auth.ts), not by Supabase Auth. All reads and
-- writes go through a server-only client using the service role key, which
-- bypasses RLS entirely. RLS is still enabled with zero policies below, so
-- the anon/authenticated roles (which this app never uses) get no access
-- by default.

create type public.finance_type as enum ('income', 'expense');

create type public.finance_category as enum (
  'income',
  'housing',
  'groceries',
  'transport',
  'utilities',
  'dining',
  'shopping',
  'health',
  'subscriptions',
  'savings',
  'other'
);

create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  type public.finance_type not null,
  category public.finance_category not null default 'other',
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index finance_transactions_occurred_idx
  on public.finance_transactions (occurred_on desc, created_at desc);

alter table public.finance_transactions enable row level security;
