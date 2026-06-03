CREATE TABLE public.ai_usage_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_user_day ON public.ai_usage_log (user_id, used_at);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own usage"
ON public.ai_usage_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own usage"
ON public.ai_usage_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
ON public.ai_usage_log FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');