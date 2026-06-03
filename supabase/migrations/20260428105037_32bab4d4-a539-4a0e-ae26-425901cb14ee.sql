-- Backfill NHS Jobs rows that have relative URLs (saved before the
-- fetch-nhs-jobs absolute-URL fix). These rows have source_url and url
-- starting with "/candidate/jobadvert/..." which breaks the Daily Jobs
-- Report hostname bucketing and the outbound links.
UPDATE public.jobs
SET
  url = 'https://www.jobs.nhs.uk' || url,
  source_url = 'https://www.jobs.nhs.uk' || source_url
WHERE url LIKE '/candidate/jobadvert/%'
  AND source_url LIKE '/candidate/jobadvert/%';