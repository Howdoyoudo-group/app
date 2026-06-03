DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_scraped_at_desc') THEN
    CREATE INDEX idx_jobs_scraped_at_desc ON public.jobs (scraped_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_industry_scraped_at') THEN
    CREATE INDEX idx_jobs_industry_scraped_at ON public.jobs (industry, scraped_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_type_scraped_at') THEN
    CREATE INDEX idx_jobs_type_scraped_at ON public.jobs (type, scraped_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_work_mode_scraped_at') THEN
    CREATE INDEX idx_jobs_work_mode_scraped_at ON public.jobs (work_mode, scraped_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_career_level_scraped_at') THEN
    CREATE INDEX idx_jobs_career_level_scraped_at ON public.jobs (career_level, scraped_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_role_category_scraped_at') THEN
    CREATE INDEX idx_jobs_role_category_scraped_at ON public.jobs (role_category, scraped_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_url') THEN
    CREATE INDEX idx_jobs_url ON public.jobs (url);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_jobs_featured_scraped_at') THEN
    CREATE INDEX idx_jobs_featured_scraped_at ON public.jobs (featured, scraped_at DESC) WHERE featured = true;
  END IF;
END $$;
ANALYZE public.jobs;