-- Lukestyle — Skills is being split in two: the existing learning_skills
-- table (Body boarding, Golf, Padel) becomes "Hobbies" (unchanged, still
-- just practice-session logging). This new learning_courses table backs
-- the new "Skills" tab: courses/things being learned to develop an actual
-- skill (e.g. AI skills), tracked with a progress bar and improvement notes.

create table public.learning_courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  progress_pct smallint not null default 0 check (progress_pct between 0 and 100),
  improvement_notes text,
  icon text not null default 'lightbulb',
  created_at timestamptz not null default now()
);

alter table public.learning_courses enable row level security;
