-- Lifestyle — University Semester 2 calendar
--
-- Adds a real lecture timetable (per-module class blocks with dates/times/
-- rooms), term-level dates (test weeks, assessment weeks, public holidays),
-- and an assignments tracker. Modules are seeded here since they're static
-- reference data; lectures/term dates/assignments are bulk-seeded separately
-- via a script once this migration has run.

create table public.university_modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  lecturer text,
  icon text not null default 'book-open',
  created_at timestamptz not null default now()
);

create table public.university_lectures (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.university_modules(id) on delete cascade,
  lecture_date date not null,
  start_time time not null,
  end_time time not null,
  room text,
  week_label text,
  created_at timestamptz not null default now()
);

create table public.university_term_dates (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_date date not null,
  end_date date not null,
  notes text,
  icon text not null default 'calendar-days',
  created_at timestamptz not null default now()
);

create table public.university_assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.university_modules(id) on delete set null,
  title text not null,
  due_date date not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'graded')),
  flagged boolean not null default false,
  icon text not null default 'flag',
  created_at timestamptz not null default now()
);

create index university_lectures_date_idx on public.university_lectures (lecture_date);
create index university_lectures_module_idx on public.university_lectures (module_id);
create index university_term_dates_range_idx on public.university_term_dates (start_date, end_date);
create index university_assignments_due_idx on public.university_assignments (due_date);
create index university_assignments_module_idx on public.university_assignments (module_id);

alter table public.university_modules enable row level security;
alter table public.university_lectures enable row level security;
alter table public.university_term_dates enable row level security;
alter table public.university_assignments enable row level security;

insert into public.university_modules (code, name, lecturer, icon) values
  ('ACBP5122', 'Accounting 1B', 'Zondi Elvis', 'calculator'),
  ('BMNG5122', 'Business Management 1B', 'Bouttell, Lynn Anne', 'briefcase'),
  ('MAKT5112', 'Introduction to Marketing Theory and Practice', 'Momogos, George Miron', 'megaphone'),
  ('PMAC5112', 'Economics 1B', 'Zain Ismail', 'trending-up');

insert into public.university_assignments (module_id, title, due_date, flagged) values
  ((select id from public.university_modules where code = 'BMNG5122'), 'Formative 2 Assignment 1', '2026-10-08', true);
