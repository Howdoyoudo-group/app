-- Tracks per-run health of direct-scraper company sources (Workday tenants
-- first; other source types can write here too). Purpose: 36 of 49
-- configured Workday companies were found returning 404/422 on every single
-- run, silently, since the only signal was a console.error nobody read.
-- This makes broken sources queryable instead of invisible.
create table if not exists source_health_log (
  id bigint generated always as identity primary key,
  checked_at timestamptz not null default now(),
  source_type text not null, -- e.g. 'workday'
  working_count int not null,
  broken_count int not null,
  broken jsonb not null default '[]'::jsonb -- [{tenant, company, status}]
);

create index if not exists source_health_log_checked_at_idx on source_health_log (checked_at desc);
