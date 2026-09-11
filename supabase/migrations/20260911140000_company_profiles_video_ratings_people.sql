-- Adds video, ratings deep-links, key people, office, contacts and news
-- fields to company_profiles so employer-managed profiles can match the
-- same richer sections added to the static "hero" company pages.
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS trustpilot_url text,
  ADD COLUMN IF NOT EXISTS glassdoor_url text,
  ADD COLUMN IF NOT EXISTS jobs_url text,
  ADD COLUMN IF NOT EXISTS key_people jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS office_locations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS news_items jsonb NOT NULL DEFAULT '[]'::jsonb;
