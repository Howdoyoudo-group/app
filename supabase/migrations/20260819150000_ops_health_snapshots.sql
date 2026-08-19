create table if not exists ops_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  total_jobs integer not null
);

create index if not exists ops_health_snapshots_checked_at_idx on ops_health_snapshots (checked_at desc);
