CREATE INDEX IF NOT EXISTS idx_jobs_scraped_at_desc ON public.jobs (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_industry_scraped_at_desc ON public.jobs (industry, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_type_scraped_at_desc ON public.jobs (type, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode_scraped_at_desc ON public.jobs (work_mode, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_career_level_scraped_at_desc ON public.jobs (career_level, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_featured_scraped_at_desc ON public.jobs (scraped_at DESC) WHERE featured = true;