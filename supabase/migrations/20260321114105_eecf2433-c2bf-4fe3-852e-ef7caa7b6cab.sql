
CREATE TABLE public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  title text NOT NULL,
  description text,
  script text,
  audio_url text,
  duration_seconds integer,
  voice_id text DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Podcast episodes are publicly readable"
  ON public.podcast_episodes FOR SELECT
  TO public
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('podcast-audio', 'podcast-audio', true);

CREATE POLICY "Public read podcast audio"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'podcast-audio');

CREATE POLICY "Service role insert podcast audio"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'podcast-audio' AND auth.role() = 'service_role');
