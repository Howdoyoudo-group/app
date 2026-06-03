CREATE POLICY "Service role can delete subscribers"
ON public.subscribers
FOR DELETE
TO public
USING (auth.role() = 'service_role'::text);