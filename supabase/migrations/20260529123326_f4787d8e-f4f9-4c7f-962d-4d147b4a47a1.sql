create or replace function public.get_full_name_by_email(p_email text)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.full_name
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(u.email) = lower(p_email)
  limit 1
$$;

revoke all on function public.get_full_name_by_email(text) from public, anon, authenticated;
grant execute on function public.get_full_name_by_email(text) to service_role;