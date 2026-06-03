-- Remove A24 (and any other) jobs with malformed URLs from the markdown
-- link-title regex bug. These all end with %22 (the URL-encoded ")
-- followed by junk like "Tax%20Associate%22".
DELETE FROM public.jobs
WHERE url ~ '%22[^/]*%22\s*$' OR url LIKE '%\%22%';

-- Re-tag A24 jobs without a clear UK location as "London, UK" so they
-- surface in the marketplace UK feed (A24 has a London office and is
-- featured in the Film & TV showcase).
UPDATE public.jobs
SET location = 'London, UK'
WHERE company = 'A24' AND (location IS NULL OR location = '' OR location = 'Various Locations');