-- Lifestyle — Vehicle: vehicle details plus fuel logging, a unified
-- recurring-reminder list (maintenance/insurance/license renewal), and a
-- service history log.

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  make text,
  model text,
  year integer,
  license_plate text,
  icon text not null default 'car',
  created_at timestamptz not null default now()
);

create table public.vehicle_reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  category text not null default 'maintenance' check (category in ('maintenance', 'insurance', 'license')),
  title text not null,
  notes text,
  provider text,
  next_due_date date not null,
  interval_days integer,
  icon text not null default 'wrench',
  created_at timestamptz not null default now()
);

create table public.vehicle_fuel_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  log_date date not null,
  odometer_km numeric,
  liters numeric,
  cost numeric not null,
  fuel_station text,
  created_at timestamptz not null default now()
);

create table public.vehicle_service_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  service_date date not null,
  odometer_km numeric,
  description text not null,
  cost numeric,
  workshop text,
  created_at timestamptz not null default now()
);

create index vehicle_reminders_vehicle_id_idx on public.vehicle_reminders (vehicle_id, next_due_date);
create index vehicle_fuel_logs_vehicle_id_idx on public.vehicle_fuel_logs (vehicle_id, log_date desc);
create index vehicle_service_logs_vehicle_id_idx on public.vehicle_service_logs (vehicle_id, service_date desc);

alter table public.vehicles enable row level security;
alter table public.vehicle_reminders enable row level security;
alter table public.vehicle_fuel_logs enable row level security;
alter table public.vehicle_service_logs enable row level security;
