CREATE OR REPLACE FUNCTION public.admin_list_users(
  _search text DEFAULT NULL,
  _limit int DEFAULT 100,
  _offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  is_premium boolean,
  is_admin boolean,
  is_employer boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.email::text,
    p.full_name,
    u.created_at,
    EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'premium'::app_role) AS is_premium,
    EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin'::app_role)   AS is_admin,
    EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'employer'::app_role) AS is_employer
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND (
      _search IS NULL OR _search = ''
      OR u.email ILIKE '%' || _search || '%'
      OR COALESCE(p.full_name,'') ILIKE '%' || _search || '%'
    )
  ORDER BY u.created_at DESC
  LIMIT GREATEST(LEAST(_limit, 500), 1)
  OFFSET GREATEST(_offset, 0);
$$;

CREATE OR REPLACE FUNCTION public.admin_set_premium(
  _user_id uuid,
  _is_premium boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _is_premium THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'premium'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = _user_id AND role = 'premium'::app_role;
  END IF;
END;
$$;