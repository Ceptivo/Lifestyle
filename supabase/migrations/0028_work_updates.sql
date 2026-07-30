-- Work: instruction-email checklists (paste an update email, track it through to done)
create table work_email_updates (
  id uuid primary key default gen_random_uuid(),
  subject text,
  source_name text,
  received_date date,
  raw_text text not null,
  created_at timestamptz not null default now()
);

create table work_update_items (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references work_email_updates(id) on delete cascade,
  context_path text,
  text text not null,
  sort_order int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'uncertain', 'confirm_pending', 'logged')),
  question_note text,
  status_changed_at timestamptz not null default now(),
  logged_at timestamptz,
  created_at timestamptz not null default now()
);

create index work_update_items_update_id_idx on work_update_items(update_id);
create index work_update_items_status_idx on work_update_items(status);

alter table work_email_updates enable row level security;
alter table work_update_items enable row level security;
