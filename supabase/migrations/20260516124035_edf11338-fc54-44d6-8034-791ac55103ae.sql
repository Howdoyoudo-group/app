CREATE OR REPLACE FUNCTION public.get_member_profile(_id uuid)
 RETURNS TABLE(id uuid, full_name text, photo_url text, home_town text, home_town_blurb text, career_level text, member_bio text, industry_interests text[], role_preferences text[], riasec_scores jsonb, work_values jsonb, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.full_name, p.photo_url, p.home_town, p.home_town_blurb,
         p.career_level, p.member_bio, p.industry_interests, p.role_preferences,
         p.riasec_scores, p.work_values, p.created_at
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