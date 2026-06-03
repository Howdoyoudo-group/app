
-- Aggregate follower counts per industry from profiles.industry_interests
CREATE OR REPLACE FUNCTION public.get_industry_follower_counts()
RETURNS TABLE(industry text, follower_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT trim(i)::text AS industry, count(*)::bigint AS follower_count
  FROM public.profiles p,
       LATERAL unnest(COALESCE(p.industry_interests, ARRAY[]::text[])) AS i
  WHERE trim(i) <> ''
  GROUP BY trim(i);
$$;

GRANT EXECUTE ON FUNCTION public.get_industry_follower_counts() TO anon, authenticated;

-- Total member count (profiles with a name, mirrors directory inclusion)
CREATE OR REPLACE FUNCTION public.get_total_member_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM public.profiles WHERE COALESCE(full_name, '') <> '';
$$;

GRANT EXECUTE ON FUNCTION public.get_total_member_count() TO anon, authenticated;
