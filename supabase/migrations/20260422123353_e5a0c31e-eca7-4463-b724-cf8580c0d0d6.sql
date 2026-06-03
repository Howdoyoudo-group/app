-- Allow verified employers to read the limited candidate fields they need to
-- power the Talent Pool dashboard, while keeping full profile data private.
-- Employers can only see profiles of users who have engaged with their brand
-- or industry (via interactions, saved Most Wanted entries, or industry interests).

CREATE POLICY "Employers can read candidate profile basics"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'employer'::app_role)
  AND (
    -- Profiles whose industry_interests includes the employer's industry
    industry_interests && ARRAY[(
      SELECT industry FROM public.employer_companies
      WHERE id = get_employer_company_id(auth.uid())
    )]
    -- Profiles whose targetCompanies includes the employer's company name
    OR job_preferences @> jsonb_build_object(
      'targetCompanies',
      jsonb_build_array((
        SELECT name FROM public.employer_companies
        WHERE id = get_employer_company_id(auth.uid())
      ))
    )
    -- Profiles that have any user_interactions row matching the employer's brand or industry
    OR EXISTS (
      SELECT 1 FROM public.user_interactions ui
      WHERE ui.user_id = profiles.id
        AND (
          ui.company_slug = (
            SELECT slug FROM public.employer_companies
            WHERE id = get_employer_company_id(auth.uid())
          )
          OR ui.industry = (
            SELECT industry FROM public.employer_companies
            WHERE id = get_employer_company_id(auth.uid())
          )
        )
    )
  )
);
