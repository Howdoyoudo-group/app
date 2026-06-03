CREATE POLICY "Users can list and read own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cv-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);