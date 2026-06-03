
DROP FUNCTION IF EXISTS public.get_member_directory(text, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_member_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_member_directory(_search text DEFAULT NULL::text, _industry text DEFAULT NULL::text, _limit integer DEFAULT 60, _offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, full_name text, photo_url text, home_town text, career_level text, member_bio text, industry_interests text[], role_preferences text[], mentor_opt_in boolean, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.full_name, p.photo_url, p.home_town, p.career_level,
         p.member_bio, p.industry_interests, p.role_preferences, p.mentor_opt_in, p.created_at
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.member_directory_opt_in = true
    AND p.id <> auth.uid()
    AND COALESCE(p.full_name, '') <> ''
    AND (
      _search IS NULL OR _search = ''
      OR p.full_name ILIKE '%' || _search || '%'
      OR p.home_town ILIKE '%' || _search || '%'
      OR p.member_bio ILIKE '%' || _search || '%'
    )
    AND (
      _industry IS NULL OR _industry = ''
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.industry_interests, ARRAY[]::text[])) i
        WHERE lower(i) = lower(_industry)
      )
    )
  ORDER BY (p.photo_url IS NOT NULL) DESC, p.updated_at DESC NULLS LAST
  LIMIT GREATEST(LEAST(_limit, 200), 1)
  OFFSET GREATEST(_offset, 0);
$function$;

CREATE OR REPLACE FUNCTION public.get_member_profile(_id uuid)
 RETURNS TABLE(id uuid, full_name text, photo_url text, home_town text, home_town_blurb text, career_level text, member_bio text, industry_interests text[], role_preferences text[], riasec_scores jsonb, work_values jsonb, mentor_opt_in boolean, mentor_bio text, mentor_offers text[], created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.full_name, p.photo_url, p.home_town, p.home_town_blurb,
         p.career_level, p.member_bio, p.industry_interests, p.role_preferences,
         p.riasec_scores, p.work_values, p.mentor_opt_in, p.mentor_bio, p.mentor_offers, p.created_at
  FROM public.profiles p
  WHERE p.id = _id
    AND auth.uid() IS NOT NULL
    AND (
      p.id = auth.uid()
      OR p.member_directory_opt_in = true
      OR EXISTS (
        SELECT 1 FROM public.member_connections mc
        WHERE ((mc.requester_id = auth.uid() AND mc.recipient_id = p.id)
            OR (mc.recipient_id = auth.uid() AND mc.requester_id = p.id))
          AND mc.status IN ('pending','accepted')
      )
    );
$function$;
