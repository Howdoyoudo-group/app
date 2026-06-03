CREATE TABLE public.industry_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry text NOT NULL,
  youtube_id text NOT NULL,
  title text NOT NULL,
  channel text,
  description text,
  duration_seconds integer,
  duration_label text,
  thumbnail_url text,
  published_at timestamptz,
  view_count bigint,
  score numeric DEFAULT 0,
  query text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (industry, youtube_id)
);

CREATE INDEX idx_industry_videos_industry_score
  ON public.industry_videos (industry, score DESC, published_at DESC);

ALTER TABLE public.industry_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Industry videos are publicly readable"
  ON public.industry_videos FOR SELECT
  USING (true);

CREATE POLICY "Service role manages industry videos"
  ON public.industry_videos FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');