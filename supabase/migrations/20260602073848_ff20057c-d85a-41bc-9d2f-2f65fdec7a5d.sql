
CREATE OR REPLACE FUNCTION public.get_public_member_preview(_industry text DEFAULT NULL, _limit integer DEFAULT 12)
RETURNS TABLE(id uuid, first_name text, photo_url text, home_town text, industry_interests text[])
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    split_part(trim(p.full_name), ' ', 1) AS first_name,
    p.photo_url,
    p.home_town,
    p.industry_interests
  FROM public.profiles p
  WHERE p.member_directory_opt_in = true
    AND COALESCE(p.full_name, '') <> ''
    AND (
      _industry IS NULL OR _industry = '' OR _industry = 'all'
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.industry_interests, ARRAY[]::text[])) i
        WHERE lower(trim(i)) = lower(trim(_industry))
      )
    )
  ORDER BY (p.photo_url IS NOT NULL) DESC, p.updated_at DESC NULLS LAST
  LIMIT GREATEST(LEAST(_limit, 50), 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_member_preview(text, integer) TO anon, authenticated;
