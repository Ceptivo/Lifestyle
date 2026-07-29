-- Lukestyle — collapse the per-week training plan into a single reusable
-- weekly template. Previously every week got its own blank plan; now there
-- is one set of 7 day slots that repeats every week, editable in place —
-- editing a day updates the template for all future weeks, not just the
-- one currently being viewed.

create table public.health_training_plan (
  day_of_week smallint primary key check (day_of_week between 0 and 6),
  title text not null,
  description text,
  icon text not null default 'dumbbell',
  updated_at timestamptz not null default now()
);

-- Carry forward whatever the most recently edited week's plan was, so
-- existing entries become the starting template instead of being lost.
insert into public.health_training_plan (day_of_week, title, description, icon)
select pi.day_of_week, pi.title, pi.description, pi.icon
from public.health_training_plan_items pi
where pi.week_id = (select id from public.health_training_weeks order by week_start_date desc limit 1)
on conflict (day_of_week) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  updated_at = now();

drop table if exists public.health_training_plan_items;
drop table if exists public.health_training_weeks;

alter table public.health_training_plan enable row level security;
