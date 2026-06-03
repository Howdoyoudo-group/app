
CREATE TABLE public.dismissed_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  reason text DEFAULT 'dismissed',
  dismissed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE public.dismissed_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own dismissed jobs"
  ON public.dismissed_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss jobs"
  ON public.dismissed_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can undo dismiss"
  ON public.dismissed_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
