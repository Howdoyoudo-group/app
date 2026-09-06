-- Job Tracker: capture the application closing date a user reads off a
-- listing. jobs.expires_at is NOT reused here - for most sources it's just
-- an internal "assume stale after N days" freshness heuristic set at
-- ingestion (typically now + 30/60 days), not the employer's real deadline
-- (NHS listings are the one exception where it's genuine). Auto-filling
-- from it would show a specific, confident-looking date that's usually
-- wrong, so this is manual: the user types in the real date from the
-- listing when they know it.

alter table public.job_tracker_items
  add column if not exists closing_date date;

comment on column public.job_tracker_items.closing_date is
  'Application closing date, entered manually by the user from the listing. Not derived from jobs.expires_at - that column is mostly an internal freshness heuristic, not a real employer deadline, for most job sources.';
