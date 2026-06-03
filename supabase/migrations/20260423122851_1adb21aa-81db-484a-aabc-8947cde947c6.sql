-- Add reply fields to contact_requests
ALTER TABLE public.contact_requests
  ADD COLUMN IF NOT EXISTS reply_message text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS employer_read_at timestamptz;

-- Allow candidates to delete contact requests sent to them ("trash")
DROP POLICY IF EXISTS "Candidates can delete their requests" ON public.contact_requests;
CREATE POLICY "Candidates can delete their requests"
ON public.contact_requests
FOR DELETE
TO authenticated
USING (auth.uid() = candidate_user_id);

-- Allow employers/admins to mark requests as read (update employer_read_at)
DROP POLICY IF EXISTS "Employers and admins update read state" ON public.contact_requests;
CREATE POLICY "Employers and admins update read state"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() = employer_user_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() = employer_user_id)
);
