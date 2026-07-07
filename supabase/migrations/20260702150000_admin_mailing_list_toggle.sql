-- Let superadmins see mailing list subscription status and toggle it from /admin/users
DROP FUNCTION IF EXISTS public.admin_list_users(text, integer, integer);

CREATE OR REPLACE FUNCTION public.admin_list_users(_search text DEFAULT NULL::text, _limit integer DEFAULT 100, _offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, email text, full_name text, created_at timestamp with time zone, is_premium boolean, is_admin boolean, is_employer boolean, is_subscribed boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    u.id,
    u.email::text,
    p.full_name,
    u.created_at,
    EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'premium'::app_role) AS is_premium,
    EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin'::app_role)   AS is_admin,
    EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'employer'::app_role) AS is_employer,
    NOT EXISTS (SELECT 1 FROM public.suppressed_emails s WHERE s.email = u.email) AS is_subscribed
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE public.has_role(auth.uid(), 'superadmin'::app_role)
    AND (
      _search IS NULL OR _search = ''
      OR u.email ILIKE '%' || _search || '%'
      OR COALESCE(p.full_name,'') ILIKE '%' || _search || '%'
    )
  ORDER BY u.created_at DESC
  LIMIT GREATEST(LEAST(_limit, 500), 1)
  OFFSET GREATEST(_offset, 0);
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_mailing_list(_user_id uuid, _subscribed boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'superadmin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT email INTO _email FROM auth.users WHERE id = _user_id;
  IF _email IS NULL THEN
    RAISE EXCEPTION 'user not found';
  END IF;

  IF _subscribed THEN
    DELETE FROM public.suppressed_emails WHERE email = _email;
  ELSE
    INSERT INTO public.suppressed_emails (email, reason, metadata)
    VALUES (_email, 'unsubscribe', jsonb_build_object('removed_by_admin', auth.uid(), 'removed_at', now()))
    ON CONFLICT (email) DO NOTHING;
  END IF;
END;
$function$;
