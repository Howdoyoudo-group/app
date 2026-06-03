CREATE OR REPLACE FUNCTION public.get_live_job_counts_by_industry()
RETURNS TABLE(industry text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT industry, count(*)::bigint
  FROM public.jobs
  WHERE (expires_at IS NULL OR expires_at > now())
    AND industry IS NOT NULL
  GROUP BY industry;
$$;