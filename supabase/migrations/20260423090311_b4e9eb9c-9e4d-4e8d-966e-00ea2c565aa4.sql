-- 1. Add photo + employer-visibility opt-in to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS employer_visibility_opt_in BOOLEAN NOT NULL DEFAULT false;

-- 2. Create avatars bucket (public-read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS — public read, owner-only write
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Replace employer-visibility policy on profiles to require explicit opt-in
DROP POLICY IF EXISTS "Employers and admins can read candidate profile basics" ON public.profiles;

CREATE POLICY "Employers and admins can read candidate profile basics"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'employer'::app_role)
    AND employer_visibility_opt_in = true
    AND (
      EXISTS (
        SELECT 1
        FROM unnest(COALESCE(profiles.industry_interests, ARRAY[]::text[])) interest(interest)
        WHERE lower(interest.interest) = lower((
          SELECT employer_companies.industry FROM employer_companies
          WHERE employer_companies.id = get_employer_company_id(auth.uid())
        ))
      )
      OR (job_preferences @> jsonb_build_object('targetCompanies', jsonb_build_array((
          SELECT employer_companies.name FROM employer_companies
          WHERE employer_companies.id = get_employer_company_id(auth.uid())
      ))))
      OR EXISTS (
        SELECT 1 FROM user_interactions ui
        WHERE ui.user_id = profiles.id
          AND (
            ui.company_slug = (
              SELECT employer_companies.slug FROM employer_companies
              WHERE employer_companies.id = get_employer_company_id(auth.uid())
            )
            OR lower(ui.industry) = lower((
              SELECT employer_companies.industry FROM employer_companies
              WHERE employer_companies.id = get_employer_company_id(auth.uid())
            ))
          )
      )
    )
  )
);