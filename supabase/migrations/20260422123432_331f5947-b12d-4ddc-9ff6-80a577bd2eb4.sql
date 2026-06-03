DROP POLICY IF EXISTS "Employers can read candidate profile basics" ON public.profiles;

CREATE POLICY "Employers can read candidate profile basics"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'employer'::app_role)
  AND (
    -- Profiles whose industry_interests includes the employer's industry (case-insensitive)
    EXISTS (
      SELECT 1
      FROM unnest(coalesce(industry_interests, ARRAY[]::text[])) AS interest
      WHERE lower(interest) = lower((
        SELECT industry FROM public.employer_companies
        WHERE id = get_employer_company_id(auth.uid())
      ))
    )
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
          OR lower(ui.industry) = lower((
            SELECT industry FROM public.employer_companies
            WHERE id = get_employer_company_id(auth.uid())
          ))
        )
    )
  )
);
