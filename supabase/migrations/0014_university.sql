-- Lifestyle — University section
--
-- Study material, upcoming tests/exams, and a report-card tracker (grades
-- grouped by subject, progress computed as an average in the app rather
-- than stored). Same single-user model: RLS enabled with zero policies,
-- all access via the server-only service-role client.

create table public.university_study_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  notes text,
  url text,
  icon text not null default 'book-open',
  created_at timestamptz not null default now()
);

create table public.university_exams (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  title text not null,
  exam_date date not null,
  notes text,
  icon text not null default 'calendar-days',
  created_at timestamptz not null default now()
);

create table public.university_grades (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  term text not null,
  assessment text not null,
  mark numeric not null,
  max_mark numeric not null default 100,
  created_at timestamptz not null default now()
);

create index university_exams_date_idx on public.university_exams (exam_date);
create index university_grades_subject_idx on public.university_grades (subject, created_at desc);

alter table public.university_study_materials enable row level security;
alter table public.university_exams enable row level security;
alter table public.university_grades enable row level security;
