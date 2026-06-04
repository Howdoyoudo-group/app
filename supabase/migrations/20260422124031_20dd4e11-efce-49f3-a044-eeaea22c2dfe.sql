-- Grant admin role to master account (only if user exists)
INSERT INTO public.user_roles (user_id, role)
SELECT 'cb860d74-051b-4264-ad76-f82537851e47', 'admin'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = 'cb860d74-051b-4264-ad76-f82537851e47')
ON CONFLICT DO NOTHING;

-- Update profiles SELECT policy so admins can read any candidate profile,
-- and employers retain scoped access.
DROP POLICY IF EXISTS "Employers can read candidate profile basics" ON public.profiles;

CREATE POLICY "Employers and admins can read candidate profile basics"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role) AND (
      EXISTS (
        SELECT 1
        FROM unnest(coalesce(industry_interests, ARRAY[]::text[])) AS interest
        WHERE lower(interest) = lower((
          SELECT industry FROM public.employer_companies
          WHERE id = get_employer_company_id(auth.uid())
        ))
      )
      OR job_preferences @> jsonb_build_object(
        'targetCompanies',
        jsonb_build_array((
          SELECT name FROM public.employer_companies
          WHERE id = get_employer_company_id(auth.uid())
        ))
      )
      OR EXISTS (
        SELECT 1 FROM public.user_interactions ui
        WHERE ui.user_id = profiles.id
          AND (
            ui.company_slug = (
              SELECT slug FROM public.employer_companies
              WHERE id = get_employer_company_id(auth.uid())
            )
            OR lower(ui.industry) = lower((
              SELECT industry FROM public.employer_companies
              WHERE id = get_employer_company_id(auth.uid())
            ))
          )
      )
    )
  )
);

-- Update user_interactions policies so admins can view all interactions
DROP POLICY IF EXISTS "Employers can view company interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Employers can view industry interactions" ON public.user_interactions;

CREATE POLICY "Employers and admins can view company interactions"
ON public.user_interactions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND company_slug IS NOT NULL
    AND company_slug = (
      SELECT slug FROM public.employer_companies
      WHERE id = get_employer_company_id(auth.uid())
    )
  )
);

CREATE POLICY "Employers and admins can view industry interactions"
ON public.user_interactions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND industry IS NOT NULL
    AND lower(industry) = lower((
      SELECT industry FROM public.employer_companies
      WHERE id = get_employer_company_id(auth.uid())
    ))
  )
);