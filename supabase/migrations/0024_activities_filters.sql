-- Lukestyle — filterable tags on Activities to do: where (indoor/outdoor),
-- what kind (physical/non-physical), and cost tier (cheap/expensive), so
-- activities can be searched by combinations of these ("outdoors and
-- physical", "indoors and cheap", etc).

alter table public.activities_todo
  add column location_type text not null default 'outdoor' check (location_type in ('indoor', 'outdoor')),
  add column physical_type text not null default 'physical' check (physical_type in ('physical', 'non_physical')),
  add column cost_tier text not null default 'cheap' check (cost_tier in ('cheap', 'expensive'));
