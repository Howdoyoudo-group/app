-- AI-generated personalised skill courses (one per user per role)
CREATE TABLE public.skill_courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_slug     TEXT NOT NULL,
  role_title    TEXT NOT NULL,
  course_title  TEXT NOT NULL DEFAULT '',
  focus_skills  TEXT[] NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'generating', -- 'generating' | 'ready' | 'error'
  generated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role_slug)
);

CREATE TABLE public.skill_course_lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES public.skill_courses(id) ON DELETE CASCADE,
  slot          INT NOT NULL,
  title         TEXT NOT NULL,
  body_markdown TEXT NOT NULL
);

CREATE TABLE public.skill_course_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES public.skill_courses(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,
  correct_index INT NOT NULL,
  explanation   TEXT
);

CREATE TABLE public.skill_course_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES public.skill_courses(id) ON DELETE CASCADE,
  lessons_completed INT[] DEFAULT '{}',
  passed            BOOLEAN DEFAULT false,
  score             INT,
  completed_at      TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX skill_courses_user_role_idx ON public.skill_courses(user_id, role_slug);
CREATE INDEX skill_course_lessons_course_idx ON public.skill_course_lessons(course_id, slot);
CREATE INDEX skill_course_questions_course_idx ON public.skill_course_questions(course_id);

ALTER TABLE public.skill_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_course_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own courses" ON public.skill_courses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own course lessons" ON public.skill_course_lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.skill_courses c WHERE c.id = course_id AND c.user_id = auth.uid())
);

CREATE POLICY "own course questions" ON public.skill_course_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.skill_courses c WHERE c.id = course_id AND c.user_id = auth.uid())
);

CREATE POLICY "own course progress" ON public.skill_course_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
