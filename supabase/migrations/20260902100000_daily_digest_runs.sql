-- Idempotency guard for send-daily-digest full-list sends. Prevents the
-- whole subscriber base getting emailed twice on the same day - whether
-- from a stray double cron fire, a manual re-trigger, or debugging.
-- (Incident: 2026-09-02, a diagnostic test call during an ops-alert
-- investigation caused a real duplicate send since the function had no
-- safe way to dry-run and no guard against running twice in one day.)
create table if not exists daily_digest_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null unique,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  subscribers_count integer,
  status text not null default 'running' check (status in ('running', 'completed', 'failed'))
);
