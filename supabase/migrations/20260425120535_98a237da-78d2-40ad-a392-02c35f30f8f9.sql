-- Re-route existing creator/social roles that were mis-tagged into bogus
-- "marketing" industry (which is not a real platform industry) so they
-- appear on the Influencing page.
UPDATE public.jobs
SET industry = 'influencing'
WHERE industry = 'marketing'
  AND (
    title ILIKE '%social media%'
    OR title ILIKE '%content creator%'
    OR title ILIKE '%creator %'
    OR title ILIKE '%influencer%'
    OR title ILIKE '%tiktok%'
    OR title ILIKE '%youtube%'
    OR title ILIKE '%instagram%'
    OR title ILIKE '%community manager%'
    OR title ILIKE '%paid social%'
    OR title ILIKE '%podcast producer%'
    OR title ILIKE '%creator partnerships%'
    OR title ILIKE '%creator marketing%'
    OR title ILIKE '%talent manager%'
  );

-- Also catch the same titles that landed in the bogus "remote" bucket
-- (the legacy inferIndustryFromTitle path).
UPDATE public.jobs
SET industry = 'influencing'
WHERE industry = 'remote'
  AND (
    title ILIKE '%social media%'
    OR title ILIKE '%content creator%'
    OR title ILIKE '%creator %'
    OR title ILIKE '%influencer%'
    OR title ILIKE '%tiktok%'
    OR title ILIKE '%youtube%'
    OR title ILIKE '%instagram%'
    OR title ILIKE '%community manager%'
    OR title ILIKE '%paid social%'
    OR title ILIKE '%podcast producer%'
    OR title ILIKE '%creator partnerships%'
    OR title ILIKE '%creator marketing%'
  );