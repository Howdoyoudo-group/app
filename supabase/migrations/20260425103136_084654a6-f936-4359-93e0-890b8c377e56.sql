-- Step 1: Find rows whose canonical URL would collide with an existing row.
-- Keep the newest row (highest scraped_at) and delete older duplicates.
WITH old AS (
  SELECT id, scraped_at,
         'https://www.adzuna.co.uk/details/' ||
           (regexp_match(url, '/jobs/land/ad/(\d+)'))[1] AS canonical_url
  FROM public.jobs
  WHERE source_url = 'adzuna.com'
    AND url ~ '/jobs/land/ad/\d+'
),
ranked AS (
  SELECT old.id, old.canonical_url, old.scraped_at,
         row_number() OVER (PARTITION BY old.canonical_url ORDER BY old.scraped_at DESC) AS rn
  FROM old
)
DELETE FROM public.jobs
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 2: Also drop any old-format row whose canonical URL already exists
-- under the new format on a different row.
DELETE FROM public.jobs j
USING public.jobs k
WHERE j.source_url = 'adzuna.com'
  AND j.url ~ '/jobs/land/ad/\d+'
  AND k.url = 'https://www.adzuna.co.uk/details/' ||
              (regexp_match(j.url, '/jobs/land/ad/(\d+)'))[1]
  AND k.id <> j.id;

-- Step 3: Rewrite the surviving rows to the canonical URL.
UPDATE public.jobs
SET url = 'https://www.adzuna.co.uk/details/' ||
          (regexp_match(url, '/jobs/land/ad/(\d+)'))[1]
WHERE source_url = 'adzuna.com'
  AND url ~ '/jobs/land/ad/\d+';