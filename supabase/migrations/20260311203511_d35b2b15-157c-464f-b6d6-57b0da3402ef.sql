-- Create jobs table for scraped job listings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  description TEXT,
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  industry TEXT,
  type TEXT DEFAULT 'Full-time',
  work_mode TEXT DEFAULT 'On-site',
  featured BOOLEAN DEFAULT false,
  source_url TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Jobs are publicly readable
CREATE POLICY "Jobs are publicly readable"
  ON public.jobs FOR SELECT
  USING (true);

-- Create indexes for common queries
CREATE INDEX idx_jobs_industry ON public.jobs(industry);
CREATE INDEX idx_jobs_company ON public.jobs(company);
CREATE INDEX idx_jobs_scraped_at ON public.jobs(scraped_at DESC);