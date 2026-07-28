-- Lifestyle — Personal Admin section
--
-- Document vault (metadata only — files live in Supabase Storage, see
-- the `documents` bucket created separately via the service-role
-- client), a password/account inventory (passwords stored encrypted,
-- never plaintext — see lib/vault-crypto.ts), and an annual life-admin
-- checklist. Same single-user model as the rest of the app: RLS enabled
-- with zero policies, all access via the server-only service-role
-- client.

create table public.personal_documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other',
  expiry_date date,
  storage_path text not null,
  file_name text not null,
  file_size bigint,
  content_type text,
  uploaded_at timestamptz not null default now()
);

create index personal_documents_expiry_idx on public.personal_documents (expiry_date);

create table public.personal_credentials (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  username text,
  encrypted_password text not null,
  url text,
  notes text,
  icon text not null default 'key',
  created_at timestamptz not null default now()
);

create table public.personal_admin_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'other',
  due_date date not null,
  recurring boolean not null default true,
  last_completed_date date,
  notes text,
  icon text not null default 'calendar-days',
  created_at timestamptz not null default now()
);

create index personal_admin_tasks_due_idx on public.personal_admin_tasks (due_date);

alter table public.personal_documents enable row level security;
alter table public.personal_credentials enable row level security;
alter table public.personal_admin_tasks enable row level security;

-- Seed: annual life-admin checklist. Car license date given directly;
-- SARS filing deadline and RA contribution deadline researched (SARS
-- 2026 filing season announcement; TaxTim on the Feb 28 RA deadline).
insert into public.personal_admin_tasks (title, category, due_date, recurring, notes, icon) values
  ('Car license renewal', 'Vehicle', '2026-07-31', true, 'Annual vehicle license disc renewal.', 'car'),
  ('File tax return (SARS)', 'Tax', '2026-10-23', true, 'Non-provisional taxpayer deadline. Filing season opened 1 July 2026; auto-assessment notices went out 1-12 July — check if you were auto-assessed before filing manually.', 'file-text'),
  ('RA contribution deadline', 'Tax', '2027-02-28', true, 'Retirement annuity contributions must be made before the tax year ends (28 Feb) to count for this year''s deduction. Deduction capped at the lesser of R430,000, 27.5% of remuneration/taxable income, or taxable income before this deduction.', 'piggy-bank');
