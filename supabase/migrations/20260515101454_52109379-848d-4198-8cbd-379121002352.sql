CREATE OR REPLACE FUNCTION public.get_premium_member_ids(_ids uuid[])
RETURNS TABLE(user_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT r.user_id
  FROM public.user_roles r
  WHERE auth.uid() IS NOT NULL
    AND r.user_id = ANY(_ids)
    AND r.role = 'premium'::app_role;
$$;