
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  title text NOT NULL,
  source text NOT NULL,
  url text NOT NULL,
  description text,
  published_at timestamp with time zone,
  scraped_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(url)
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are publicly readable" ON public.articles
  FOR SELECT TO public
  USING (true);

CREATE TABLE public.breaking_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  title text NOT NULL,
  source text NOT NULL,
  url text NOT NULL,
  published_at timestamp with time zone,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(url)
);

ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Breaking news is publicly readable" ON public.breaking_news
  FOR SELECT TO public
  USING (true);
