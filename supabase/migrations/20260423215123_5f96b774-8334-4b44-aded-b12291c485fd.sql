
CREATE TABLE public.sent_newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  industry TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  briefing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (recipient_email, industry, briefing_date)
);

CREATE INDEX idx_sent_newsletters_email_date ON public.sent_newsletters (recipient_email, sent_at DESC);

ALTER TABLE public.sent_newsletters ENABLE ROW LEVEL SECURITY;

-- Service role full access (for the digest edge function)
CREATE POLICY "Service role manages sent newsletters"
ON public.sent_newsletters
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can read their own sent newsletters by matching their auth email
CREATE POLICY "Users can read their own sent newsletters"
ON public.sent_newsletters
FOR SELECT
TO authenticated
USING (
  lower(recipient_email) = lower(COALESCE((auth.jwt() ->> 'email'), ''))
);
