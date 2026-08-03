-- Lifestyle — University assignments: allow TBC due dates
--
-- Some assessments (Written Unseen Exams, Portfolio of Evidence items) are
-- confirmed to happen but don't have a published date yet. Rather than
-- blocking those from being tracked at all, due_date becomes nullable —
-- null means "TBC", editable later once the date is announced.

alter table public.university_assignments alter column due_date drop not null;
