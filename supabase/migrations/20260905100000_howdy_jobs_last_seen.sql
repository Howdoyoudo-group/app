-- Watermark for "Howdy Jobs" so the nav badge and in-app toast can genuinely
-- mean "N new matches since you last checked" instead of raw queue size.
alter table public.profiles
  add column if not exists howdy_jobs_last_seen_at timestamptz;
