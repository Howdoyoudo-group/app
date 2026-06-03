
-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', false);

-- Allow anonymous uploads (for non-authenticated sign-up flow)
CREATE POLICY "Anyone can upload CVs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cv-uploads');

-- Allow service role to read CVs (for edge function analysis)
CREATE POLICY "Service role can read CVs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cv-uploads' AND auth.role() = 'service_role');

-- Allow service role to delete CVs after analysis
CREATE POLICY "Service role can delete CVs"
ON storage.objects FOR DELETE
USING (bucket_id = 'cv-uploads' AND auth.role() = 'service_role');
