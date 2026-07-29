-- Lifestyle — Work and University goals
--
-- Same shape as health_goals: freeform goals with a simple
-- planned -> in_progress -> done status. Single-user model: RLS enabled
-- with zero policies, all access via the server-only service-role client.

create table public.work_goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  icon text not null default 'target',
  created_at timestamptz not null default now()
);

create table public.university_goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  icon text not null default 'target',
  created_at timestamptz not null default now()
);

alter table public.work_goals enable row level security;
alter table public.university_goals enable row level security;
