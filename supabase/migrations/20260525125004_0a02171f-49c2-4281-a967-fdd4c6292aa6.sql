
-- Industry events table for the Attend tab
CREATE TABLE IF NOT EXISTS public.industry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  title text NOT NULL,
  description text,
  event_type text, -- conference, talk, webinar, awards, networking, exhibition
  organizer text,
  location text, -- "London, UK" or "Online"
  starts_on date,
  ends_on date,
  date_label text, -- human "3-5 Mar 2026" for free-text fallback
  url text NOT NULL,
  source text DEFAULT 'perplexity',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (industry, url)
);

CREATE INDEX IF NOT EXISTS industry_events_industry_starts_idx
  ON public.industry_events (industry, starts_on);

CREATE INDEX IF NOT EXISTS industry_events_fetched_idx
  ON public.industry_events (fetched_at DESC);

ALTER TABLE public.industry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "industry_events readable by all"
  ON public.industry_events FOR SELECT
  USING (true);

-- Writes only via service role (edge function); no insert/update/delete policies for anon/auth.
