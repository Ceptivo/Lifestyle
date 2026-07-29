-- Lukestyle — Lunch Options: a freeform, editable list of go-to lunch
-- ideas, shown in a side panel on the Restaurant Savers page.

create table public.lunch_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  icon text not null default 'utensils-crossed',
  created_at timestamptz not null default now()
);

alter table public.lunch_options enable row level security;
