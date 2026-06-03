UPDATE public.jobs
SET
  type = 'Full-time',
  career_level = NULL,
  tags = COALESCE(
    array_remove(array_remove(tags, 'Graduate'), 'Internship'),
    '{}'::text[]
  )
WHERE type = 'Internship'
  AND (
    title ~* '\m(senior|lead|principal|staff|head of|manager|director|chief|partner|consultant|architect|specialist|supervisor|vp|vice president|sr\.?|associate director)\m'
    OR COALESCE(salary_max, 0) > 38000
  );