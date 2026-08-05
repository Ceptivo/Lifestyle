-- Lifestyle — Habit Tracker: a list of habits, each with a per-day
-- completion log so streaks and a short history can be computed.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'target',
  created_at timestamptz not null default now()
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index habit_logs_habit_id_log_date_idx on public.habit_logs (habit_id, log_date desc);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
