-- Create public bucket for "things you love" photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('love-photos', 'love-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Love photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'love-photos');

-- Authenticated users can upload to their own folder (user_id/...)
CREATE POLICY "Users can upload their own love photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'love-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own love photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'love-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own love photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'love-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);