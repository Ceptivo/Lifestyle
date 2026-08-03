-- Lifestyle — track lecture attendance with a tick box per session.
-- Lectures are already one row per specific date/time/module, so a plain
-- boolean on that row is enough — no separate attendance table needed.

alter table public.university_lectures add column attended boolean not null default false;
create index university_lectures_attended_idx on public.university_lectures (attended) where attended;
