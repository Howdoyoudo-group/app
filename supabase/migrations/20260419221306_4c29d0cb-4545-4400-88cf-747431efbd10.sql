-- Enable pg_trgm extension and add a trigram index on jobs.title 
-- to speed up ILIKE '%keyword%' searches used by role-based filtering 
-- in the marketplace. Without this, large OR clauses on title cause 
-- statement timeouts on the 40k-row jobs table.
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm 
  ON public.jobs USING gin (title extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_jobs_role_category_lower 
  ON public.jobs (lower(role_category));

CREATE INDEX IF NOT EXISTS idx_jobs_ai_role_category_lower 
  ON public.jobs (lower(ai_role_category));