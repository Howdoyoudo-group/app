-- Rotation cursor for validate-jobs — take 2.
--
-- A full unscoped validate-jobs run scans ~60k rows but was killed by the
-- background time budget before finishing, and restarted at offset 0 every run,
-- so rows deep in the table were never validated/reassigned/purged.
--
-- First attempt stamped a per-row last_validated_at column, but the jobs table
-- carries an HNSW vector index on `embedding`: every row UPDATE forces HNSW
-- index maintenance (~80ms/row), so marking tens of thousands of rows per run
-- is far too slow (200 rows already took ~16s, past the 8s statement timeout).
--
-- Instead we keep the position in a SEPARATE one-row table and walk jobs by
-- primary key (a fast index-only read, no write to jobs at all). The only jobs
-- writes are the deletes/reassigns that were always necessary, and those are
-- comparatively few.
create table if not exists public.validate_cursor (
  id       boolean primary key default true,
  last_id  uuid,
  updated_at timestamptz not null default now(),
  constraint validate_cursor_singleton check (id)
);

insert into public.validate_cursor (id, last_id) values (true, null)
  on conflict (id) do nothing;
