ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_town text,
  ADD COLUMN IF NOT EXISTS home_town_blurb text;