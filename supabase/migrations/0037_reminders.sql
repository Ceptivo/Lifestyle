-- Lifestyle — Reminders: freeform reminders with a priority flag and an
-- optional "timer" (when the reminder is for). Each reminder can also be
-- pinned onto the Home briefing (show_on_home), optionally scoped to a
-- from/to display window so it only surfaces on Home during that period —
-- it always stays listed in the Reminders section either way.
--
-- remind_at/home_display_start/home_display_end are plain "timestamp"
-- (no time zone) columns, matching the rest of this app's convention of
-- treating stored date/time values as the user's own local wall-clock time
-- rather than converting through UTC (single user, single time zone, no DST
-- in South Africa — see lib/format.ts's todayLocalDate()).

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'urgent')),
  remind_at timestamp,
  show_on_home boolean not null default false,
  home_display_start timestamp,
  home_display_end timestamp,
  created_at timestamptz not null default now()
);

create index reminders_priority_idx on public.reminders (priority, created_at desc);
create index reminders_show_on_home_idx on public.reminders (show_on_home);

alter table public.reminders enable row level security;
