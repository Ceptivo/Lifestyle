-- Lifestyle — Health goals
--
-- Freeform health/fitness goals (e.g. race times, sleep targets, training
-- consistency) with a simple planned -> in_progress -> done status, same
-- shape as social_shared_goals. Single-user model: RLS enabled with zero
-- policies, all access via the server-only service-role client.

create table public.health_goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  icon text not null default 'target',
  created_at timestamptz not null default now()
);

alter table public.health_goals enable row level security;
