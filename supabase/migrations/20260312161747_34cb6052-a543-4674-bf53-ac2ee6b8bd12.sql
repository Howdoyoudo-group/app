
CREATE TABLE public.career_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  job_title text NOT NULL,
  company text NOT NULL,
  industry text NOT NULL,
  career_stage text,
  salary_range text,
  years_experience integer,
  bio text,
  typical_day text,
  skills_required text[],
  how_they_got_the_job text,
  advice text,
  photo_url text,
  podcast_episode text,
  related_jobs_tag text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Career profiles are publicly readable"
  ON public.career_profiles
  FOR SELECT
  TO public
  USING (true);
