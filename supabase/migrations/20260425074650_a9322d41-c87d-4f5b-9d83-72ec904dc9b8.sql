ALTER TABLE public.employer_companies
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_rank integer;

CREATE INDEX IF NOT EXISTS idx_employer_companies_featured
  ON public.employer_companies (industry, featured, featured_rank)
  WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_jobs_industry_featured
  ON public.jobs (industry, featured)
  WHERE featured = true;