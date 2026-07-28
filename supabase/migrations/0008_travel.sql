-- Lifestyle — Travel & Experiences section
--
-- A proper trip-planning hub (countdown, packing list, savings goal,
-- itinerary) plus a bucket list. Same single-user model as the rest of
-- the app: RLS enabled with zero policies, all access via the
-- server-only service-role client. Trip savings are a standalone
-- tracked number here, independent of real Finance transactions — same
-- independence Social's shared goals already have from Finance.

create table public.travel_trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text,
  start_date date not null,
  end_date date,
  savings_goal_amount numeric(12, 2) not null default 0,
  savings_current_amount numeric(12, 2) not null default 0,
  icon text not null default 'plane',
  notes text,
  created_at timestamptz not null default now()
);

create index travel_trips_start_idx on public.travel_trips (start_date);

create table public.travel_packing_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  name text not null,
  category text,
  packed boolean not null default false,
  created_at timestamptz not null default now()
);

create index travel_packing_items_trip_idx on public.travel_packing_items (trip_id);

create table public.travel_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.travel_trips(id) on delete cascade,
  item_date date not null,
  item_time time,
  title text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index travel_itinerary_items_trip_idx on public.travel_itinerary_items (trip_id, item_date);

create table public.travel_bucket_list (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_date date,
  estimated_cost numeric(12, 2),
  notes text,
  achieved boolean not null default false,
  icon text not null default 'star',
  created_at timestamptz not null default now()
);

alter table public.travel_trips enable row level security;
alter table public.travel_packing_items enable row level security;
alter table public.travel_itinerary_items enable row level security;
alter table public.travel_bucket_list enable row level security;
