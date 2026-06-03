UPDATE public.jobs
SET industry = 'cars'
WHERE company ILIKE 'tesla'
  AND industry IN ('beauty', 'grocery');