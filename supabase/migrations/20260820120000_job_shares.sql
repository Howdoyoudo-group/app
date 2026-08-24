create table if not exists public.job_shares (
  id uuid primary key default gen_random_uuid(),
  job_id text not null,
  shared_by uuid not null references public.profiles(id) on delete cascade,
  shared_with uuid not null references public.profiles(id) on delete cascade,
  job_title text,
  company text,
  share_link text,
  shared_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists job_shares_shared_with_idx on public.job_shares(shared_with);
create index if not exists job_shares_shared_by_idx on public.job_shares(shared_by);

alter table public.job_shares enable row level security;

create policy "Users can view shares sent to or by them"
  on public.job_shares for select
  using (auth.uid() = shared_by or auth.uid() = shared_with);

create policy "Users can create shares as themselves"
  on public.job_shares for insert
  with check (auth.uid() = shared_by);

create policy "Recipients can mark shares as read"
  on public.job_shares for update
  using (auth.uid() = shared_with)
  with check (auth.uid() = shared_with);
