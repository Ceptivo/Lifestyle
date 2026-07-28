-- A single freeform scratchpad for the user's own raw budget plan text —
-- separate from the structured per-category finance_budgets rows, so they
-- can keep an uncategorized reference list and edit it directly.
create table finance_budget_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null default '',
  updated_at timestamptz not null default now()
);

alter table finance_budget_notes enable row level security;

insert into finance_budget_notes (id, content) values (
  '00000000-0000-0000-0000-000000000001',
  'INCOME
Monthly income — R10 000

EXPENSES
Haircuts (2x) — R180
Spotify Premium (9th of every month) — R69,99
Google One (13th of every month) — R14,99
Claude Pro (27th of every month) — R400
Golf — R336
Padel — R250
Meal prep / lunches — R2500
Petrol — R1500
Going out / entertainment — R2000
Nedbank gold card maintenance fee (28th of every month) — R8
Kindle Unlimited (16th of every month) — R205
Nedbank credit card fee — R65

TRANSFERS
32 Day Notice (25th of every month) — R420
S&P 500 investment (25th of every month) — R500'
);
