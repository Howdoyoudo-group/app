DELETE FROM public.jobs
WHERE industry = 'footwear'
  AND (
    company ILIKE 'boots%'
    OR company ILIKE '%tesla%'
    OR title ILIKE '%tesla%'
  );