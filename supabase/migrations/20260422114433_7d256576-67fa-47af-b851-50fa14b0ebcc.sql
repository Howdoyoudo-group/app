
-- =========================================
-- 1. ROLES SYSTEM
-- =========================================
CREATE TYPE public.app_role AS ENUM ('employer', 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 2. EMPLOYER COMPANIES
-- =========================================
CREATE TABLE public.employer_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  industry text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employer_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active companies are publicly readable"
  ON public.employer_companies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage companies"
  ON public.employer_companies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 3. EMPLOYER USERS (link auth user -> company)
-- =========================================
CREATE TABLE public.employer_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.employer_companies(id) ON DELETE CASCADE,
  contact_name text,
  job_title text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employer_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_employer_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.employer_users WHERE user_id = _user_id LIMIT 1
$$;

CREATE POLICY "Employers can view own employer record"
  ON public.employer_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage employer users"
  ON public.employer_users FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 4. USER INTERACTIONS (engagement tracking)
-- =========================================
CREATE TABLE public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('company_view','industry_view','job_click','help_apply')),
  company_slug text,
  industry text,
  job_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_interactions_company ON public.user_interactions(company_slug, created_at DESC);
CREATE INDEX idx_user_interactions_industry ON public.user_interactions(industry, created_at DESC);
CREATE INDEX idx_user_interactions_user ON public.user_interactions(user_id);

ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log own interactions"
  ON public.user_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions"
  ON public.user_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Employers can read interactions for THEIR company (read-only, anonymised in app layer)
CREATE POLICY "Employers can view company interactions"
  ON public.user_interactions FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'employer')
    AND company_slug IS NOT NULL
    AND company_slug = (
      SELECT slug FROM public.employer_companies
      WHERE id = public.get_employer_company_id(auth.uid())
    )
  );

-- Employers can read industry interactions for THEIR industry
CREATE POLICY "Employers can view industry interactions"
  ON public.user_interactions FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'employer')
    AND industry IS NOT NULL
    AND industry = (
      SELECT industry FROM public.employer_companies
      WHERE id = public.get_employer_company_id(auth.uid())
    )
  );

-- =========================================
-- 5. CONTACT REQUESTS
-- =========================================
CREATE TABLE public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.employer_companies(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE INDEX idx_contact_requests_candidate ON public.contact_requests(candidate_user_id);
CREATE INDEX idx_contact_requests_employer ON public.contact_requests(employer_user_id);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers create requests for their company"
  ON public.contact_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_user_id
    AND public.has_role(auth.uid(), 'employer')
    AND company_id = public.get_employer_company_id(auth.uid())
  );

CREATE POLICY "Employers view their own requests"
  ON public.contact_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = employer_user_id);

CREATE POLICY "Candidates view requests sent to them"
  ON public.contact_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_user_id);

CREATE POLICY "Candidates can respond to their requests"
  ON public.contact_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = candidate_user_id)
  WITH CHECK (auth.uid() = candidate_user_id);

-- =========================================
-- 6. AI SUMMARIES CACHE
-- =========================================
CREATE TABLE public.employer_ai_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.employer_companies(id) ON DELETE CASCADE,
  summary text NOT NULL,
  match_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employer_user_id, candidate_user_id)
);

ALTER TABLE public.employer_ai_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view own summaries"
  ON public.employer_ai_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = employer_user_id);

CREATE POLICY "Service role manages summaries"
  ON public.employer_ai_summaries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =========================================
-- 7. SEED COMPANIES
-- =========================================
INSERT INTO public.employer_companies (slug, name, industry) VALUES
  ('me-em','ME+EM','fashion'),
  ('gails','Gail''s Bakery','bakery'),
  ('dr-martens','Dr. Martens','footwear'),
  ('nike','Nike','footwear'),
  ('birkenstock','Birkenstock','footwear'),
  ('timberland','Timberland','footwear'),
  ('ugg','UGG','footwear'),
  ('ocado','Ocado','grocery'),
  ('greggs','Greggs','bakery'),
  ('save-the-children','Save the Children','charity'),
  ('netflix','Netflix','cinema'),
  ('everyman','Everyman Cinema','cinema'),
  ('grind','Grind','coffee'),
  ('savills','Savills','estate-agency'),
  ('rightmove','Rightmove','estate-agency'),
  ('burberry','Burberry','fashion'),
  ('asos','ASOS','fashion'),
  ('premier-league','Premier League','football'),
  ('sky-sports','Sky Sports','football'),
  ('tesco','Tesco','grocery'),
  ('soho-house','Soho House','hospitality'),
  ('tom-dixon','Tom Dixon','interior-design'),
  ('dice','DICE','music'),
  ('teach-first','Teach First','teaching'),
  ('adidas','Adidas','footwear'),
  ('purplebricks','Purplebricks','estate-agency'),
  ('costa','Costa Coffee','coffee'),
  ('starbucks','Starbucks','coffee'),
  ('caffe-nero','Caffè Nero','coffee'),
  ('blank-street','Blank Street','coffee'),
  ('hawkstone','Hawkstone','beer'),
  ('five-guys','Five Guys','hospitality'),
  ('pragnell','Pragnell','jewellery'),
  ('news-uk','News UK','journalism')
ON CONFLICT (slug) DO NOTHING;
