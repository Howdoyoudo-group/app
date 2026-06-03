
-- Public bucket for team assets (brand kit, site videos, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('team-assets', 'team-assets', true, 524288000) -- 500MB limit for videos
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 524288000;

-- Anyone can read (public bucket)
CREATE POLICY "Public read team-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-assets');

-- Only admins can upload
CREATE POLICY "Admins upload team-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-assets'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can update
CREATE POLICY "Admins update team-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-assets'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete
CREATE POLICY "Admins delete team-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-assets'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
