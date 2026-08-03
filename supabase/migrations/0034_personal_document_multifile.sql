-- Lifestyle — Personal Admin: allow multiple files per document (e.g. the
-- front and back of an ID card or license) instead of exactly one.
-- personal_documents becomes pure metadata; the actual file references
-- move to a child table, one row per uploaded file.

create table public.personal_document_files (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.personal_documents(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size bigint,
  content_type text,
  created_at timestamptz not null default now()
);

create index personal_document_files_document_idx on public.personal_document_files (document_id);

alter table public.personal_document_files enable row level security;

-- Carry forward existing single-file documents into the new table.
insert into public.personal_document_files (document_id, storage_path, file_name, file_size, content_type)
select id, storage_path, file_name, file_size, content_type from public.personal_documents;

alter table public.personal_documents drop column storage_path;
alter table public.personal_documents drop column file_name;
alter table public.personal_documents drop column file_size;
alter table public.personal_documents drop column content_type;
