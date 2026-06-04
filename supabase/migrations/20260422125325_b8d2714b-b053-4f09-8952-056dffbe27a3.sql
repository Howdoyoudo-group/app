-- Grant admin role to correct master account (andrewandtristia@gmail.com)
INSERT INTO public.user_roles (user_id, role)
SELECT '2c709954-222e-4889-bf97-3f91385ca0a8', 'admin'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = '2c709954-222e-4889-bf97-3f91385ca0a8')
ON CONFLICT DO NOTHING;

-- Remove admin role from incorrect account (typo)
DELETE FROM public.user_roles
WHERE user_id = 'cb860d74-051b-4264-ad76-f82537851e47'
  AND role = 'admin';