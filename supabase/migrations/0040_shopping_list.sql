-- Lifestyle — Shopping List: a plain checkable list for everyday shopping
-- trips, distinct from the priced/categorized "Things I Need" buy-list.

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.shopping_list_items enable row level security;
