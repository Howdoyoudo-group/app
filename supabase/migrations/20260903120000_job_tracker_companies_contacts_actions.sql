-- Job Tracker: support company-only opportunities (not tied to a specific
-- job posting), multiple time-based actions per opportunity, and contacts
-- (people to approach for advice - optionally tied to a company and/or a
-- specific tracked opportunity, or fully standalone).

alter table public.job_tracker_items
  alter column title drop not null,
  add column if not exists opportunity_type text not null default 'job'
    check (opportunity_type in ('job', 'company'));

comment on column public.job_tracker_items.opportunity_type is
  'job = tracking a specific posting; company = a company to approach speculatively, no posting yet.';
comment on column public.job_tracker_items.title is
  'Nullable - company-type opportunities may have no specific role title yet.';

create table public.job_tracker_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracker_item_id uuid not null references public.job_tracker_items(id) on delete cascade,
  description text not null,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.job_tracker_actions enable row level security;

create policy "Users can view own tracker actions"
on public.job_tracker_actions for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add tracker actions"
on public.job_tracker_actions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own tracker actions"
on public.job_tracker_actions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own tracker actions"
on public.job_tracker_actions for delete
to authenticated
using (auth.uid() = user_id);

create index idx_job_tracker_actions_user on public.job_tracker_actions(user_id);
create index idx_job_tracker_actions_item on public.job_tracker_actions(tracker_item_id);

comment on table public.job_tracker_actions is
  'Multiple time-based to-dos per Job Tracker opportunity - replaces the old single next_action/follow_up_date pair on job_tracker_items (left in place, unused by new UI).';

create table public.job_tracker_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracker_item_id uuid references public.job_tracker_items(id) on delete set null,
  company text,
  name text not null,
  role text,
  relationship text,
  contact_info text,
  notes text,
  status text not null default 'not_contacted'
    check (status in ('not_contacted', 'messaged', 'responded', 'met')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_tracker_contacts enable row level security;

create policy "Users can view own tracker contacts"
on public.job_tracker_contacts for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add tracker contacts"
on public.job_tracker_contacts for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own tracker contacts"
on public.job_tracker_contacts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own tracker contacts"
on public.job_tracker_contacts for delete
to authenticated
using (auth.uid() = user_id);

create index idx_job_tracker_contacts_user on public.job_tracker_contacts(user_id);
create index idx_job_tracker_contacts_item on public.job_tracker_contacts(tracker_item_id);

comment on table public.job_tracker_contacts is
  'People to approach for advice/networking - tracker_item_id and company are both optional and independent, so a contact can be scoped to a specific tracked opportunity, to a company in general (key contacts there), or be fully standalone (e.g. a mentor with no company link at all).';
