-- Lifestyle — Health & Wellness section
--
-- Training (per-week plans, activity log, races), Sleep, and Journal.
-- Same single-user model as Finance: RLS enabled with zero policies, all
-- access via the server-only service-role client. Loggable rows carry a
-- `source` column ('manual' today, 'samsung_health' reserved) so a real
-- Samsung Health sync can slot in later without a schema change — Samsung's
-- API requires their gated developer approval, which isn't available yet.

create table public.health_races (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discipline text not null default 'Hyrox',
  division text,
  age_group text,
  location text,
  event_date date not null,
  result_time text,
  result_notes text,
  icon text not null default 'flag',
  created_at timestamptz not null default now()
);

create index health_races_event_date_idx on public.health_races (event_date);

create table public.health_training_weeks (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null unique,
  created_at timestamptz not null default now()
);

create table public.health_training_plan_items (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.health_training_weeks(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  title text not null,
  description text,
  icon text not null default 'dumbbell',
  created_at timestamptz not null default now(),
  unique (week_id, day_of_week)
);

create index health_training_plan_items_week_idx on public.health_training_plan_items (week_id);

create table public.health_activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  activity_type text not null default 'Run',
  performed_on date not null default current_date,
  duration_minutes numeric(8, 1),
  distance_km numeric(8, 2),
  calories numeric(8, 1),
  source text not null default 'manual' check (source in ('manual', 'samsung_health')),
  external_id text,
  notes text,
  icon text not null default 'dumbbell',
  created_at timestamptz not null default now()
);

create index health_activities_performed_idx on public.health_activities (performed_on desc);

create table public.health_sleep_logs (
  id uuid primary key default gen_random_uuid(),
  sleep_date date not null default current_date,
  bedtime time,
  wake_time time,
  duration_hours numeric(4, 1),
  quality_rating smallint check (quality_rating between 1 and 5),
  mood_next_day smallint check (mood_next_day between 1 and 5),
  energy_next_day smallint check (energy_next_day between 1 and 5),
  source text not null default 'manual' check (source in ('manual', 'samsung_health')),
  notes text,
  created_at timestamptz not null default now()
);

create index health_sleep_logs_date_idx on public.health_sleep_logs (sleep_date desc);

create table public.health_journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  symptom text not null,
  severity smallint not null check (severity between 1 and 10),
  body_area text,
  triggers text,
  notes text,
  icon text not null default 'pill',
  created_at timestamptz not null default now()
);

create index health_journal_entries_date_idx on public.health_journal_entries (entry_date desc);

alter table public.health_races enable row level security;
alter table public.health_training_weeks enable row level security;
alter table public.health_training_plan_items enable row level security;
alter table public.health_activities enable row level security;
alter table public.health_sleep_logs enable row level security;
alter table public.health_journal_entries enable row level security;

-- Seed: Hyrox Johannesburg 2026, Men's Doubles, 19-25 age group, raced 31 May.
-- Event held 30-31 May 2026 at the Johannesburg Expo Centre (Nasrec).
-- Standard Hyrox format: 8x1km runs alternating with 8 functional stations
-- (SkiErg, sled push, sled pull, burpee broad jumps, rowing, farmers carry,
-- sandbag lunges, wall balls); in Doubles the two athletes split/share
-- station work. No finish time was provided — left null, editable later.
insert into public.health_races (name, discipline, division, age_group, location, event_date, result_notes, icon)
values (
  'Hyrox Johannesburg 2026',
  'Hyrox',
  'Men''s Doubles',
  '19-25',
  'Johannesburg Expo Centre, Nasrec, South Africa',
  '2026-05-31',
  'Standard Hyrox format: 8x 1km runs alternating with 8 functional stations (SkiErg, sled push, sled pull, burpee broad jumps, rowing, farmers carry, sandbag lunges, wall balls). Doubles division — station work split/shared with partner.',
  'flag'
);
