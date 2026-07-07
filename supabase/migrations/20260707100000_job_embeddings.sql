-- Phase 3: semantic matching via pgvector.
-- 768-dim embeddings from gemini-embedding-001 (output_dimensionality=768):
-- half the index size of the default 1536+ dims with negligible quality loss
-- at this corpus size.

create extension if not exists vector;

alter table jobs add column if not exists embedding vector(768);
alter table profiles
  add column if not exists preference_embedding vector(768),
  add column if not exists preference_embedded_at timestamptz;

-- HNSW: fast approximate nearest-neighbour for the discovery candidate pass.
create index if not exists idx_jobs_embedding on jobs
  using hnsw (embedding vector_cosine_ops);

-- Pre-scored matches now carry the semantic score (so the client never calls
-- the embeddings API), which algorithm produced them, and whether the row is
-- a core match or a discovery ("you might love this") suggestion.
alter table job_matches
  add column if not exists semantic_score real,
  add column if not exists algorithm_version smallint not null default 1,
  add column if not exists match_kind text not null default 'core'
    check (match_kind in ('core', 'discovery'));

-- Cosine-similarity helper used by score-new-jobs: one round trip scores a
-- candidate id-list against a user's preference embedding.
create or replace function match_jobs_semantic(
  p_user_id uuid,
  p_job_ids uuid[]
) returns table (job_id uuid, similarity real)
language sql stable as $$
  select j.id, (1 - (j.embedding <=> p.preference_embedding))::real
  from jobs j
  cross join (select preference_embedding from profiles where id = p_user_id) p
  where j.id = any(p_job_ids)
    and j.embedding is not null
    and p.preference_embedding is not null;
$$;

-- Semantic candidate sourcing: top-N live jobs by similarity to the user's
-- preference embedding, regardless of industry — feeds the discovery pool.
create or replace function top_jobs_semantic(
  p_user_id uuid,
  p_limit int default 200
) returns table (job_id uuid, similarity real)
language sql stable as $$
  select j.id, (1 - (j.embedding <=> p.preference_embedding))::real as similarity
  from jobs j
  cross join (select preference_embedding from profiles where id = p_user_id) p
  where j.embedding is not null
    and p.preference_embedding is not null
    and j.expires_at > now()
  order by j.embedding <=> p.preference_embedding
  limit p_limit;
$$;
