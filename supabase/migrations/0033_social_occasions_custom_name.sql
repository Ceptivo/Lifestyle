-- Lifestyle — allow Social occasions for someone who isn't a tracked
-- "person" yet. person_id becomes optional; person_name is the free-text
-- fallback used when no person record is linked.

alter table public.social_occasions alter column person_id drop not null;
alter table public.social_occasions add column person_name text;
