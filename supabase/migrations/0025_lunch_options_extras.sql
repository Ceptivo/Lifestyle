-- Lukestyle — categorize lunch options, add a price for filtering, and a
-- 1-5 rating so places already visited can be ranked.

alter table public.lunch_options
  add column category text,
  add column price numeric,
  add column rating smallint check (rating between 1 and 5);
