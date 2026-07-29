-- Lifestyle — Profile improvement notes
--
-- A freeform, date/time-stamped journal of self-improvement notes, reached
-- from the profile page. Same single-user model as the rest of the app:
-- RLS enabled with zero policies, all access via the server-only
-- service-role client.

create table public.profile_improvement_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.profile_improvement_notes enable row level security;
