create table public.job_tracker_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  company text not null,
  title text not null,
  url text,
  location text,
  salary text,
  industry text,
  status text not null default 'wishlist'
    check (status in ('wishlist','applied','interviewing','offer','rejected','withdrawn')),
  notes text,
  next_action text,
  follow_up_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_tracker_items enable row level security;

create policy "Users can view own tracker items"
on public.job_tracker_items for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add tracker items"
on public.job_tracker_items for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own tracker items"
on public.job_tracker_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own tracker items"
on public.job_tracker_items for delete
to authenticated
using (auth.uid() = user_id);

create index idx_job_tracker_items_user on public.job_tracker_items(user_id);
create index idx_job_tracker_items_status on public.job_tracker_items(user_id, status);

comment on table public.job_tracker_items is
  'User-owned job application pipeline (Job Tracker feature) - wishlist through offer/rejected, jobs can be referenced from the internal jobs table or added manually.';
