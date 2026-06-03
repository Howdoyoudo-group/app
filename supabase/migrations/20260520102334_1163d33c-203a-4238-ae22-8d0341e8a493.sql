
-- 1. Profile fields for mentor opt-in
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mentor_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mentor_bio text,
  ADD COLUMN IF NOT EXISTS mentor_offers text[] DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_profiles_mentor_opt_in
  ON public.profiles (mentor_opt_in)
  WHERE mentor_opt_in = true;

-- 2. Mentor requests table
CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  industry text,
  role text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','cancelled')),
  response_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT mentor_requests_distinct CHECK (mentee_id <> mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentor ON public.mentor_requests (mentor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentee ON public.mentor_requests (mentee_id, created_at DESC);

ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentee can create request"
ON public.mentor_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentee can view own requests"
ON public.mentor_requests FOR SELECT TO authenticated
USING (auth.uid() = mentee_id);

CREATE POLICY "Mentor can view incoming requests"
ON public.mentor_requests FOR SELECT TO authenticated
USING (auth.uid() = mentor_id);

CREATE POLICY "Admin can view all requests"
ON public.mentor_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mentee can cancel own pending request"
ON public.mentor_requests FOR UPDATE TO authenticated
USING (auth.uid() = mentee_id AND status = 'pending')
WITH CHECK (auth.uid() = mentee_id AND status IN ('pending','cancelled'));

CREATE POLICY "Mentor can respond to incoming request"
ON public.mentor_requests FOR UPDATE TO authenticated
USING (auth.uid() = mentor_id)
WITH CHECK (auth.uid() = mentor_id);

-- 3. Directory RPC
CREATE OR REPLACE FUNCTION public.get_mentor_directory(
  _search text DEFAULT NULL,
  _industry text DEFAULT NULL,
  _role text DEFAULT NULL,
  _limit integer DEFAULT 60,
  _offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  photo_url text,
  home_town text,
  career_level text,
  mentor_bio text,
  mentor_offers text[],
  industry_interests text[],
  role_preferences text[],
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.photo_url, p.home_town, p.career_level,
         p.mentor_bio, p.mentor_offers, p.industry_interests, p.role_preferences, p.created_at
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.mentor_opt_in = true
    AND p.id <> auth.uid()
    AND COALESCE(p.full_name, '') <> ''
    AND (
      _search IS NULL OR _search = ''
      OR p.full_name ILIKE '%' || _search || '%'
      OR p.mentor_bio ILIKE '%' || _search || '%'
    )
    AND (
      _industry IS NULL OR _industry = ''
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.industry_interests, ARRAY[]::text[])) i
        WHERE lower(i) = lower(_industry)
      )
    )
    AND (
      _role IS NULL OR _role = ''
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.mentor_offers, ARRAY[]::text[])) o
        WHERE lower(o) = lower(_role)
      )
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.role_preferences, ARRAY[]::text[])) r
        WHERE lower(r) = lower(_role)
      )
    )
  ORDER BY (p.photo_url IS NOT NULL) DESC, p.updated_at DESC NULLS LAST
  LIMIT GREATEST(LEAST(_limit, 200), 1)
  OFFSET GREATEST(_offset, 0);
$$;
