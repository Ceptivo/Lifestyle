-- Lifestyle — Home & Environment section
--
-- Home maintenance reminders and a chore checklist. Same single-user
-- model as the rest of the app: RLS enabled with zero policies, all
-- access via the server-only service-role client.

create table public.home_maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  interval_days integer,
  next_due_date date not null default current_date,
  icon text not null default 'wrench',
  created_at timestamptz not null default now()
);

create index home_maintenance_tasks_due_idx on public.home_maintenance_tasks (next_due_date);

create table public.home_chores (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  recurring boolean not null default false,
  interval_days integer,
  completed boolean not null default false,
  last_completed_date date,
  icon text not null default 'list-checks',
  created_at timestamptz not null default now()
);

alter table public.home_maintenance_tasks enable row level security;
alter table public.home_chores enable row level security;
