-- Andrew asked for "how to improve" suggestions alongside the curiosity
-- score (see CuriosityScoreCard.tsx / the header badge popovers). The score
-- and curiosity_breadth (a single 0-5 count) already existed, but nothing
-- recorded WHICH of the 5 signal categories (browsing, saves, tracker,
-- feed saves, courses/badges - see compute-curiosity-scores/index.ts) were
-- actually active for a given user, so there was no way to say "you're
-- missing X" without guessing.
--
-- Storing the category keys directly from the same computation that already
-- produces curiosity_breadth (rather than re-deriving activity client-side
-- from the five underlying tables) keeps one source of truth - if the
-- scoring weights/decay ever change, this list changes with it automatically
-- instead of silently drifting out of sync with a second implementation.
alter table public.profiles
  add column curiosity_active_categories jsonb;

comment on column public.profiles.curiosity_active_categories is
  'Array of curiosity-score category keys (browsing/saves/tracker/learning_content/courses_badges) currently meeting the breadth threshold. Written by compute-curiosity-scores alongside curiosity_breadth.';
