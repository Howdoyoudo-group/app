-- Allow employers to view the full profile of any candidate who has replied to their contact request
CREATE POLICY "Employers can view profiles of candidates who replied"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.contact_requests cr
      WHERE cr.candidate_user_id = profiles.id
        AND cr.employer_user_id = auth.uid()
        AND cr.status = 'replied'
    )
  )
);

-- Helper function so employers can read the candidate's auth email after the candidate has replied.
-- SECURITY DEFINER bypasses RLS but enforces its own check: caller must be the employer on a 'replied' contact_request for that candidate.
CREATE OR REPLACE FUNCTION public.get_replied_candidate_email(_candidate_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NOT (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.contact_requests cr
      WHERE cr.candidate_user_id = _candidate_id
        AND cr.employer_user_id = auth.uid()
        AND cr.status = 'replied'
    )
  ) THEN
    RETURN NULL;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = _candidate_id;
  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_replied_candidate_email(uuid) TO authenticated;