-- Lifestyle — Health Journal: free-form daily diary entries (thoughts,
-- feelings, how the day went), distinct from the symptom tracker that
-- previously lived at /health/journal and has moved to /health/symptoms.

create table public.health_diary_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index health_diary_entries_entry_date_idx on public.health_diary_entries (entry_date desc);

alter table public.health_diary_entries enable row level security;
