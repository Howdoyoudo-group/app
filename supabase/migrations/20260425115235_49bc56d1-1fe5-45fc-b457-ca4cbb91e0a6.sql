CREATE TABLE public.adzuna_run_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_errors INTEGER NOT NULL DEFAULT 0,
  total_jobs_returned INTEGER NOT NULL DEFAULT 0,
  sweeps JSONB NOT NULL DEFAULT '[]'::jsonb,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  trigger_source TEXT,
  industries TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_adzuna_run_log_started_at ON public.adzuna_run_log(started_at DESC);

ALTER TABLE public.adzuna_run_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view adzuna run log"
ON public.adzuna_run_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages adzuna run log"
ON public.adzuna_run_log
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');