-- Soft dedupe: same (lower(title), lower(company), lower(location)) → keep one row per group
-- Use ctid as a final tiebreaker so rows with identical created_at still collapse to one.
DELETE FROM public.jobs a
USING public.jobs b
WHERE lower(coalesce(a.title, '')) = lower(coalesce(b.title, ''))
  AND lower(coalesce(a.company, '')) = lower(coalesce(b.company, ''))
  AND lower(coalesce(a.location, '')) = lower(coalesce(b.location, ''))
  AND (a.created_at, a.ctid) < (b.created_at, b.ctid);

-- Soft-dedupe unique index on (lower(title), lower(company), lower(location)).
-- Combined with the existing url unique index, this prevents both
-- "same URL twice" AND "different URLs for the exact same posting".
CREATE UNIQUE INDEX IF NOT EXISTS jobs_title_company_location_unique_idx
  ON public.jobs (lower(title), lower(company), lower(coalesce(location, '')));