DROP POLICY IF EXISTS "Employers create requests for their company" ON public.contact_requests;

CREATE POLICY "Employers and admins create requests"
ON public.contact_requests
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = employer_user_id)
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (
      has_role(auth.uid(), 'employer'::app_role)
      AND company_id = get_employer_company_id(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Employers view their own requests" ON public.contact_requests;

CREATE POLICY "Employers and admins view requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = employer_user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);