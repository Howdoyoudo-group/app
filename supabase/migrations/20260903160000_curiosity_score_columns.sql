-- Composite "curiosity score" per user - a percentile rank (0-100) of
-- platform-wide engagement breadth, blending user_interactions,
-- saved_jobs/liked_jobs, job_tracker_items pipeline depth, saved_feed_items,
-- and skill_course_progress/earned_badges completions, each with its own
-- recency decay. Computed daily by the compute-curiosity-scores edge
-- function. Surfaced to employers in the Talent Pool dashboard and blended
-- into computeMatch() there.
--
-- New columns only, on the existing profiles table - reuses the existing
-- "Employers and admins can read candidate profile basics" RLS policy for
-- free (row-level security, not column-level), so no new RLS/RPC is needed
-- for employers to read this.

alter table public.profiles
  add column if not exists curiosity_score numeric,
  add column if not exists curiosity_score_raw numeric,
  add column if not exists curiosity_breadth smallint,
  add column if not exists curiosity_score_computed_at timestamptz;

comment on column public.profiles.curiosity_score is
  'Composite curiosity score (0-100, percentile rank across all profiles) blending user_interactions, saved_jobs/liked_jobs, job_tracker_items, saved_feed_items, and skill_course_progress/earned_badges, with per-category recency decay and a breadth multiplier. Computed daily by the compute-curiosity-scores edge function.';
comment on column public.profiles.curiosity_score_raw is
  'Pre-percentile weighted total behind curiosity_score, kept for future recalibration - not shown to employers directly.';
comment on column public.profiles.curiosity_breadth is
  'Count (0-5) of the signal categories that were active for this user when curiosity_score was last computed.';
