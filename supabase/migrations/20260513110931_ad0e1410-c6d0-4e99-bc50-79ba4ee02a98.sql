ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS howdy_memory text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS howdy_tour_completed_at timestamptz;