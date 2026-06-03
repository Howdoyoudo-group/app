
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_frequency text NOT NULL DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS whatsapp_last_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS public.whatsapp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone_e164 text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_verif_user ON public.whatsapp_verifications(user_id, created_at DESC);

ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own verifications"
  ON public.whatsapp_verifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role manages verifications"
  ON public.whatsapp_verifications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.whatsapp_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  phone_e164 text NOT NULL,
  template_name text NOT NULL,
  status text NOT NULL,
  twilio_message_sid text,
  error_message text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_send_log_user ON public.whatsapp_send_log(user_id, created_at DESC);

ALTER TABLE public.whatsapp_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view whatsapp send log"
  ON public.whatsapp_send_log FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages whatsapp send log"
  ON public.whatsapp_send_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
