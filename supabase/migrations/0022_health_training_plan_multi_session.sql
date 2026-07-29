-- Lukestyle — allow multiple planned sessions on the same day of the
-- weekly training plan template (e.g. "Morning run" + "Evening strength").
-- day_of_week was the primary key (one row per day); switch to a
-- generated id so any number of rows can share a day_of_week.

alter table public.health_training_plan drop constraint health_training_plan_pkey;
alter table public.health_training_plan add column id uuid not null default gen_random_uuid();
alter table public.health_training_plan add constraint health_training_plan_pkey primary key (id);
create index health_training_plan_day_of_week_idx on public.health_training_plan (day_of_week);
