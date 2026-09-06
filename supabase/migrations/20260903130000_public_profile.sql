-- Public shareable profile page (howdoyoudo.co.uk/u/:handle) - opt-in only,
-- off by default. See get_public_profile() below for the explicit field
-- allowlist; home_address/phone/whatsapp_number/date_of_birth/
-- salary_expectation are never selectable through it, not just hidden
-- client-side.

alter table public.profiles
  add column if not exists public_handle text,
  add column if not exists public_profile_opt_in boolean not null default false;

alter table public.profiles
  add constraint public_handle_format
  check (public_handle is null or public_handle ~ '^[a-z][a-z0-9-]{2,29}$');

create unique index if not exists profiles_public_handle_unique_idx
  on public.profiles (lower(public_handle))
  where public_handle is not null;

comment on column public.profiles.public_handle is
  'URL-safe handle for the public profile at /u/:handle. Lowercase letters/digits/hyphens, 3-30 chars, starts with a letter. NULL until the user sets one.';
comment on column public.profiles.public_profile_opt_in is
  'Defaults false (unlike member_directory_opt_in) - a public, indexable, logged-out-visible URL is higher exposure than the internal member directory, so it requires an explicit opt-in.';

create or replace function public.get_public_profile(_handle text)
returns table(
  id uuid,
  full_name text,
  photo_url text,
  home_town text,
  home_town_blurb text,
  career_level text,
  location_preference text,
  industry_interests text[],
  role_preferences text[],
  riasec_scores jsonb,
  work_values jsonb,
  job_preferences jsonb,
  understand_me_results jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.full_name, p.photo_url, p.home_town, p.home_town_blurb,
    p.career_level, p.location_preference, p.industry_interests,
    p.role_preferences, p.riasec_scores, p.work_values, p.job_preferences,
    p.understand_me_results
  from public.profiles p
  where p.public_profile_opt_in = true
    and p.public_handle is not null
    and lower(p.public_handle) = lower(trim(_handle))
  limit 1;
$$;

comment on function public.get_public_profile(text) is
  'Public, unauthenticated read for /u/:handle. Explicit column allowlist only - never add home_address, phone, whatsapp_number, date_of_birth or salary_expectation here.';

grant execute on function public.get_public_profile(text) to anon, authenticated;

create or replace function public.is_public_handle_available(_handle text, _exclude_user_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles p
    where lower(p.public_handle) = lower(trim(_handle))
      and (_exclude_user_id is null or p.id <> _exclude_user_id)
  );
$$;

grant execute on function public.is_public_handle_available(text, uuid) to authenticated;
