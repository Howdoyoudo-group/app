-- Industry health monitor log
CREATE TABLE IF NOT EXISTS public.industry_health_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer,
  trigger_source text,
  industries_checked integer NOT NULL DEFAULT 0,
  industries_unhealthy integer NOT NULL DEFAULT 0,
  industries_refetched integer NOT NULL DEFAULT 0,
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.industry_health_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view industry health log"
  ON public.industry_health_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages industry health log"
  ON public.industry_health_log FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

CREATE INDEX IF NOT EXISTS idx_industry_health_log_started_at
  ON public.industry_health_log (started_at DESC);

-- Schedule the monitor every 6 hours
SELECT cron.unschedule('industry-health-monitor-6h')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'industry-health-monitor-6h');

SELECT cron.schedule(
  'industry-health-monitor-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/industry-health-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q", "x-trigger-source": "cron-6h"}'::jsonb,
    body := jsonb_build_object('time', now())
  ) AS request_id;
  $$
);