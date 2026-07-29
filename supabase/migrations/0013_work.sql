-- Lifestyle — Work section
--
-- A task tracker and a freeform notes section. Same single-user model as
-- the rest of the app: RLS enabled with zero policies, all access via the
-- server-only service-role client.

create table public.work_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  done boolean not null default false,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  icon text not null default 'clipboard-list',
  created_at timestamptz not null default now()
);

create table public.work_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

alter table public.work_tasks enable row level security;
alter table public.work_notes enable row level security;
