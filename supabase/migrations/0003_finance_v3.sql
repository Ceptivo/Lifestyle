-- Lifestyle — Finance v3: subscriptions (auto-pay), forecast support
--
-- Recurring bills/subscriptions get their own table. Payments a
-- subscription generates are real finance_transactions rows (via
-- subscription_id) so balance, Analytics, and Budgets all reflect them
-- naturally — subscriptions are not a siloed number. subscription_id also
-- lets Forecast exclude subscription-originated spend from its historical
-- baseline, avoiding double-counting a bill as both "average spending" and
-- an explicit upcoming subscription cost.

create type public.subscription_cycle as enum ('weekly', 'monthly', 'yearly');
create type public.subscription_status as enum ('active', 'paused', 'cancelled');

create table public.finance_subscriptions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'repeat',
  amount numeric(12, 2) not null check (amount > 0),
  cycle public.subscription_cycle not null default 'monthly',
  account_id uuid not null references public.finance_accounts(id) on delete restrict,
  category_id uuid not null references public.finance_categories(id) on delete restrict,
  next_due_date date not null,
  status public.subscription_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.finance_transactions
  add column subscription_id uuid references public.finance_subscriptions(id) on delete set null;

create index finance_subscriptions_next_due_idx on public.finance_subscriptions (next_due_date);
create index finance_transactions_subscription_idx on public.finance_transactions (subscription_id);

alter table public.finance_subscriptions enable row level security;
