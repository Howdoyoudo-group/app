UPDATE public.jobs
SET industry = 'hospitality'
WHERE industry = 'cars'
  AND (title ILIKE '%cook%' OR title ILIKE '%chef%' OR title ILIKE '%catering%' OR company ILIKE '%hertfordshire catering%');