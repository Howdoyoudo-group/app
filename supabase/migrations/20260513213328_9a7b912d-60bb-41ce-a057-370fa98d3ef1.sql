CREATE TABLE public.serpapi_usage (
  month text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.serpapi_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view serpapi usage"
  ON public.serpapi_usage FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can modify serpapi usage"
  ON public.serpapi_usage FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));