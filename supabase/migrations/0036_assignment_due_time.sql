-- Lifestyle — separate the assignment due time from its free-text
-- description. Previously the time (e.g. "11:30") was crammed into the
-- notes field; this splits it into its own column so the description
-- field can hold actual notes.

alter table public.university_assignments add column due_time time;
