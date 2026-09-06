-- Caches whatever Howdy generated for an application (cover letter, and for
-- the richer tailor-application flow, CV tips/keywords/company insight) so
-- reopening a saved or applied job doesn't burn another AI call regenerating
-- the same content.
alter table public.job_tracker_items
  add column if not exists application_helper jsonb;
