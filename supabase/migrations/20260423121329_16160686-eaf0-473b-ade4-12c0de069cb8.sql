CREATE TABLE public.dismissed_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.employer_companies(id) ON DELETE CASCADE,
  candidate_user_id UUID NOT NULL,
  dismissed_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (company_id, candidate_user_id)
);

ALTER TABLE public.dismissed_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers and admins view dismissals"
ON public.dismissed_candidates FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employer'::app_role) AND company_id = get_employer_company_id(auth.uid()))
);

CREATE POLICY "Employers and admins dismiss candidates"
ON public.dismissed_candidates FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = dismissed_by
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (has_role(auth.uid(), 'employer'::app_role) AND company_id = get_employer_company_id(auth.uid()))
  )
);

CREATE POLICY "Employers and admins undo dismissals"
ON public.dismissed_candidates FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employer'::app_role) AND company_id = get_employer_company_id(auth.uid()))
);

CREATE INDEX idx_dismissed_candidates_company ON public.dismissed_candidates(company_id);