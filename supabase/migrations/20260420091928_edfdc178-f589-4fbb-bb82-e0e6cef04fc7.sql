-- 1. Delete US/non-UK fashion jobs (safe pruning before unique index)
DELETE FROM public.jobs
WHERE industry ILIKE 'fashion'
  AND (
    location ~* ', (MA|CA|NY|TX|IN|NH|MI|IL|WA|FL|GA|OH|PA|VA|NC|CO|OR|AZ|NJ|MD|MN|WI|TN|MO|UT|NV|CT)\b'
    OR location ILIKE '%, USA%'
    OR location ILIKE '%United States%'
    OR location ILIKE '%Bangalore%'
    OR location ILIKE '%, India%'
    OR location ILIKE '%India,%'
    OR location ILIKE '%Mountain View%'
    OR location ILIKE '%Sunnyvale%'
    OR location ILIKE '%Santa Monica%'
    OR location ILIKE '%San Francisco%'
    OR location ILIKE '%New York%'
    OR location ILIKE '%Boston%'
    OR location ILIKE '%Indianapolis%'
    OR location ILIKE '%Portsmouth, NH%'
    OR location ILIKE '%Warren, MI%'
    OR location ILIKE '%Austin, TX%'
  );

-- 2. Dedupe by URL — keep the most recent row per URL
DELETE FROM public.jobs a
USING public.jobs b
WHERE a.url = b.url
  AND a.ctid < b.ctid;

-- 3. Add unique index to prevent any future duplication
CREATE UNIQUE INDEX IF NOT EXISTS jobs_url_unique_idx ON public.jobs (url);