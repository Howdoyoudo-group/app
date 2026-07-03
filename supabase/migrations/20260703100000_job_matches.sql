-- Pre-scored job matches per user.
-- Populated by the score-new-jobs edge function after each scrape.
-- Lets the frontend fetch a pre-ranked candidate pool instead of
-- paginating through 2,000 newest jobs and scoring everything in browser.

CREATE TABLE IF NOT EXISTS job_matches (
  user_id    uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id     uuid      NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  score      smallint  NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

-- Fast lookup of a user's matches ordered by score descending
CREATE INDEX IF NOT EXISTS idx_job_matches_user_score
  ON job_matches (user_id, score DESC, computed_at DESC);

-- Allow RLS: users can only read their own matches
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own matches"
  ON job_matches FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (edge function writes)
CREATE POLICY "Service role full access"
  ON job_matches FOR ALL
  USING (true)
  WITH CHECK (true);
