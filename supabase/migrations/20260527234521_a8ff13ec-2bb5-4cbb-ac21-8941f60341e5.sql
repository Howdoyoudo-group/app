
-- Lesson cache (AI-generated, publicly readable so the page is fast for everyone)
CREATE TABLE public.badge_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  slot integer NOT NULL,
  title text NOT NULL,
  body_markdown text NOT NULL,
  source_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(industry, slot)
);
GRANT SELECT ON public.badge_lessons TO anon, authenticated;
GRANT ALL ON public.badge_lessons TO service_role;
ALTER TABLE public.badge_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are publicly readable" ON public.badge_lessons FOR SELECT USING (true);
CREATE POLICY "Service role manages lessons" ON public.badge_lessons FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Quiz questions (service role only — clients never see correct_index)
CREATE TABLE public.badge_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  explanation text,
  generated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.badge_questions TO service_role;
ALTER TABLE public.badge_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages questions" ON public.badge_questions FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Lesson progress per user
CREATE TABLE public.badge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  industry text NOT NULL,
  lessons_completed integer[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, industry)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badge_progress TO authenticated;
GRANT ALL ON public.badge_progress TO service_role;
ALTER TABLE public.badge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own progress" ON public.badge_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.badge_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.badge_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.badge_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Earned badges
CREATE TABLE public.earned_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  industry text NOT NULL,
  score integer NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  visible_to_employers boolean NOT NULL DEFAULT true,
  UNIQUE(user_id, industry)
);
GRANT SELECT, UPDATE ON public.earned_badges TO authenticated;
GRANT ALL ON public.earned_badges TO service_role;
ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own badges" ON public.earned_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own badge visibility" ON public.earned_badges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role manages badges" ON public.earned_badges FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- Employers can read badges of candidates they can already see (mirrors existing employer-visibility logic)
CREATE POLICY "Employers read visible candidate badges" ON public.earned_badges FOR SELECT TO authenticated
USING (
  visible_to_employers = true AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (
      has_role(auth.uid(), 'employer'::app_role) AND (
        lower(industry) = lower((SELECT ec.industry FROM employer_companies ec WHERE ec.id = get_employer_company_id(auth.uid())))
        OR EXISTS (
          SELECT 1 FROM contact_requests cr
          WHERE cr.candidate_user_id = earned_badges.user_id
            AND cr.employer_user_id = auth.uid()
            AND cr.details_shared = true
        )
      )
    )
  )
);

CREATE INDEX idx_earned_badges_user ON public.earned_badges(user_id);
CREATE INDEX idx_badge_questions_industry ON public.badge_questions(industry);
