
-- Employer enquiries for package interest
CREATE TABLE public.employer_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  phone text,
  package_interest text NOT NULL DEFAULT 'standard',
  message text,
  industry text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employer_enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an enquiry
CREATE POLICY "Anyone can submit employer enquiry"
  ON public.employer_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read/update/delete
CREATE POLICY "Service role can manage enquiries"
  ON public.employer_enquiries FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Employer-submitted jobs (auto-publish into main jobs table via trigger)
-- We'll store them directly in the jobs table with a source marker
