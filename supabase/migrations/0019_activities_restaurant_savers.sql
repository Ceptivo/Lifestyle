-- Lifestyle — Activities to do + Restaurant Savers
--
-- activities_todo: a simple bucket-list-style table of things to do, with a
-- cost estimate and location. Same shape as travel_bucket_list.
--
-- restaurant_specials: a Monday-Friday list of daily food specials, so you
-- can filter to "what's on special today". Single-user model: RLS enabled
-- with zero policies, all access via the server-only service-role client.

create table public.activities_todo (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  cost_estimate numeric,
  notes text,
  done boolean not null default false,
  icon text not null default 'compass',
  created_at timestamptz not null default now()
);

create table public.restaurant_specials (
  id uuid primary key default gen_random_uuid(),
  day_of_week text not null check (day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
  restaurant_name text not null,
  item_name text not null,
  price numeric,
  notes text,
  icon text not null default 'utensils-crossed',
  created_at timestamptz not null default now()
);

create index restaurant_specials_day_of_week_idx on public.restaurant_specials (day_of_week);

alter table public.activities_todo enable row level security;
alter table public.restaurant_specials enable row level security;
