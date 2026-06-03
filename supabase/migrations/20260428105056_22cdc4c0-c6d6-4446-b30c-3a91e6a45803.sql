UPDATE public.jobs
SET source_url = 'https://www.jobs.nhs.uk' || source_url
WHERE source_url LIKE '/candidate/jobadvert/%';