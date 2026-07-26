-- Multiple simultaneous target roles per user (Phase 2). Replaces the
-- single-scalar profiles.active_role_slug/active_role_set_at from Phase 1.
create table if not exists public.user_target_roles (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  role_slug text not null,
  set_at    timestamptz not null default now(),
  unique (user_id, role_slug)
);

create index if not exists user_target_roles_user_idx on public.user_target_roles(user_id);

alter table public.user_target_roles enable row level security;

create policy "Users can manage their own target roles"
  on public.user_target_roles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.user_target_roles (user_id, role_slug, set_at)
select id, active_role_slug, coalesce(active_role_set_at, now())
from public.profiles
where active_role_slug is not null
on conflict (user_id, role_slug) do nothing;

alter table public.profiles
  drop column if exists active_role_slug,
  drop column if exists active_role_set_at;
