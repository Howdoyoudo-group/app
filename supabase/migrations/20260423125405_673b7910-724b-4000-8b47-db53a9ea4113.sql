-- Per-thread consent flag
ALTER TABLE public.contact_requests
ADD COLUMN IF NOT EXISTS details_shared boolean NOT NULL DEFAULT false;

-- Profile-level "always share" preference
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS share_details_default boolean NOT NULL DEFAULT false;

-- Tighten the reveal: employers only see profile details when details_shared is true
DROP POLICY IF EXISTS "Employers can view profiles of candidates who replied" ON public.profiles;
CREATE POLICY "Employers can view profiles of candidates who shared"
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
        AND cr.details_shared = true
    )
  )
);

-- Update the email reveal RPC to require details_shared
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
        AND cr.details_shared = true
    )
  ) THEN
    RETURN NULL;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = _candidate_id;
  RETURN v_email;
END;
$$;