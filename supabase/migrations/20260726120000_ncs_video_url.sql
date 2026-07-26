-- NCS job-profile pages embed a real "meet a professional" YouTube video
-- (e.g. youtube-nocookie.com/embed/{id}) for most roles - confirmed live on
-- /job-profiles/plumber and /job-profiles/electrician. It's rendered via
-- iframe, not a plain link, so the existing markdown-only Firecrawl fetch
-- never captured it. Adding html to the scrape formats and parsing the
-- iframe src separately.
ALTER TABLE public.role_metadata
  ADD COLUMN IF NOT EXISTS ncs_video_url TEXT;
