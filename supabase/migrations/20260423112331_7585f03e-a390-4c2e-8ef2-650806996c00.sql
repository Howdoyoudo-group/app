-- Add posted_by to track which employer user created a job
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS posted_by uuid;

CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);

-- Allow employers to insert jobs for their own company
CREATE POLICY "Employers can post jobs for their company"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND posted_by = auth.uid()
    AND lower(company) = lower((
      SELECT name FROM public.employer_companies
      WHERE id = get_employer_company_id(auth.uid())
    ))
  )
);

-- Allow employers to update their own jobs (e.g. toggle premium, edit copy)
CREATE POLICY "Employers can update their own jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND posted_by = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND posted_by = auth.uid()
  )
);

-- Allow employers to delete their own jobs
CREATE POLICY "Employers can delete their own jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND posted_by = auth.uid()
  )
);
