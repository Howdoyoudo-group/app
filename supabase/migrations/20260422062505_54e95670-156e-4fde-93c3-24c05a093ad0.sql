CREATE TABLE public.daily_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  briefing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  main_news TEXT,
  people TEXT,
  takeaway TEXT,
  source_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT daily_briefings_industry_date_unique UNIQUE (industry, briefing_date)
);

CREATE INDEX idx_daily_briefings_industry_date ON public.daily_briefings (industry, briefing_date DESC);

ALTER TABLE public.daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily briefings are publicly readable"
  ON public.daily_briefings
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage daily briefings"
  ON public.daily_briefings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');