-- Skills England integration tables
-- role_se_mapping: maps our role slugs → official SE occupation codes
-- role_skills: structured skills per role (from NCS + Firecrawl KSBs + AI)
-- user_skill_ratings: user self-assessments per skill

-- Official SE occupation match per role slug
CREATE TABLE IF NOT EXISTS public.role_se_mapping (
  slug             TEXT PRIMARY KEY REFERENCES public.role_metadata(slug) ON DELETE CASCADE,
  se_occ_code      TEXT,
  se_occ_name      TEXT,
  se_level         INT,
  se_route         TEXT,
  match_method     TEXT CHECK (match_method IN ('title_exact', 'title_fuzzy', 'ai_mapped', 'unmatched')),
  match_score      NUMERIC(3,2),
  synced_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Structured skills per role
CREATE TABLE IF NOT EXISTS public.role_skills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL REFERENCES public.role_metadata(slug) ON DELETE CASCADE,
  skill_title     TEXT NOT NULL,
  skill_type      TEXT CHECK (skill_type IN ('knowledge', 'skill', 'behaviour')),
  broad_domain    TEXT,
  skill_area      TEXT,
  source          TEXT NOT NULL CHECK (source IN ('ncs', 'firecrawl_ksb', 'ai_generated')),
  se_ksb_ref      TEXT,
  display_order   INT DEFAULT 0,
  synced_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(slug, skill_title)
);

CREATE INDEX IF NOT EXISTS role_skills_slug_idx   ON public.role_skills(slug);
CREATE INDEX IF NOT EXISTS role_skills_domain_idx ON public.role_skills(broad_domain);
CREATE INDEX IF NOT EXISTS role_skills_type_idx   ON public.role_skills(skill_type);

-- RLS: public read, service-role write (mirrors role_metadata pattern)
ALTER TABLE public.role_se_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read role_se_mapping"
  ON public.role_se_mapping FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read role_skills"
  ON public.role_skills FOR SELECT TO anon, authenticated USING (true);

-- User self-ratings per skill
CREATE TABLE IF NOT EXISTS public.user_skill_ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id   UUID NOT NULL REFERENCES public.role_skills(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  evidenced  BOOLEAN DEFAULT false NOT NULL,
  source     TEXT DEFAULT 'self' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS user_skill_ratings_user_idx  ON public.user_skill_ratings(user_id);
CREATE INDEX IF NOT EXISTS user_skill_ratings_skill_idx ON public.user_skill_ratings(skill_id);

ALTER TABLE public.user_skill_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own skill ratings"
  ON public.user_skill_ratings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lightweight sync cursor on role_metadata
ALTER TABLE public.role_metadata ADD COLUMN IF NOT EXISTS se_synced_at TIMESTAMPTZ;
