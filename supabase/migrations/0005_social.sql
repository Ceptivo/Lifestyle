-- Lifestyle — Social & Relationships section
--
-- Person cards with logged interactions and a "keep in touch" cadence,
-- shared goals/date planning, and a gift/occasion tracker. Same
-- single-user model as Finance/Health: RLS enabled with zero policies,
-- all access via the server-only service-role client.

create table public.social_people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  relationship_type text not null default 'friend',
  icon text not null default 'user',
  interaction_target_count smallint not null default 2,
  interaction_period_days smallint not null default 30,
  notes text,
  created_at timestamptz not null default now()
);

create table public.social_interactions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.social_people(id) on delete cascade,
  occurred_on date not null default current_date,
  interaction_type text not null default 'Meetup',
  notes text,
  created_at timestamptz not null default now()
);

create index social_interactions_person_idx on public.social_interactions (person_id, occurred_on desc);

create table public.social_occasions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.social_people(id) on delete cascade,
  label text not null,
  occasion_date date not null,
  recurring boolean not null default true,
  gift_ideas text,
  icon text not null default 'gift',
  created_at timestamptz not null default now()
);

create index social_occasions_person_idx on public.social_occasions (person_id);

create table public.social_shared_goals (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.social_people(id) on delete set null,
  name text not null,
  description text,
  target_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  icon text not null default 'target',
  created_at timestamptz not null default now()
);

create index social_shared_goals_person_idx on public.social_shared_goals (person_id);

alter table public.social_people enable row level security;
alter table public.social_interactions enable row level security;
alter table public.social_occasions enable row level security;
alter table public.social_shared_goals enable row level security;

-- Seed: Leah (partner), with the two occasions given explicitly — started
-- dating 7 July 2026, birthday 12 September. Interaction cadence left at
-- the table default (2 / 30 days); no real cadence was given, editable
-- from the People page.
with leah as (
  insert into public.social_people (name, relationship_type, icon)
  values ('Leah', 'partner', 'user')
  returning id
)
insert into public.social_occasions (person_id, label, occasion_date, recurring, icon)
select id, 'Anniversary', '2026-07-07'::date, true, 'heart-pulse' from leah
union all
select id, 'Leah''s Birthday', '2026-09-12'::date, true, 'gift' from leah;
