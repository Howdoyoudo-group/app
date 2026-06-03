
DROP TABLE IF EXISTS public.industry_videos CASCADE;

CREATE TABLE public.industry_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel TEXT,
  channel_id TEXT,
  description TEXT,
  published_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  view_count BIGINT,
  window_tag TEXT NOT NULL DEFAULT 'month',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (industry, youtube_id)
);

CREATE INDEX idx_industry_videos_lookup
  ON public.industry_videos (industry, window_tag, published_at DESC);

ALTER TABLE public.industry_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "industry_videos public read"
  ON public.industry_videos FOR SELECT
  USING (true);
