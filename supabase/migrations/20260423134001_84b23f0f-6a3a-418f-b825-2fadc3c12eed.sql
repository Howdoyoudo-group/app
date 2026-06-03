CREATE POLICY "Employers and admins can delete requests"
ON public.contact_requests
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR auth.uid() = employer_user_id
);