create table if not exists public.liked_jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  job_id      text not null,
  liked_at    timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (user_id, job_id)
);

alter table public.liked_jobs enable row level security;

create policy "Users can manage their own liked jobs"
  on public.liked_jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index liked_jobs_user_id_idx on public.liked_jobs(user_id);
