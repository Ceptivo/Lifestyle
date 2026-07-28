-- Lifestyle — Learning & Growth section
--
-- Reading list with progress tracking, and a skill-practice log. Same
-- single-user model as the rest of the app: RLS enabled with zero
-- policies, all access via the server-only service-role client.

create table public.learning_reading_list (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  status text not null default 'reading' check (status in ('want_to_read', 'reading', 'finished')),
  progress_pct smallint not null default 0 check (progress_pct between 0 and 100),
  reason text,
  started_date date,
  finished_date date,
  icon text not null default 'book-open',
  created_at timestamptz not null default now()
);

create table public.learning_skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'target',
  created_at timestamptz not null default now()
);

create table public.learning_skill_sessions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.learning_skills(id) on delete cascade,
  session_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index learning_skill_sessions_skill_idx on public.learning_skill_sessions (skill_id, session_date desc);

alter table public.learning_reading_list enable row level security;
alter table public.learning_skills enable row level security;
alter table public.learning_skill_sessions enable row level security;

-- Seed: the three skills the user is actively practicing.
insert into public.learning_skills (name, icon) values
  ('Body boarding', 'droplet'),
  ('Golf', 'target'),
  ('Padel', 'activity');
