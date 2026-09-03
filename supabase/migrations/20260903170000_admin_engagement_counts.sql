-- Admin site-stats dashboard: saved_jobs/liked_jobs/job_tracker_items/
-- saved_feed_items only have owner-row RLS (auth.uid() = user_id), no admin
-- bypass, so a plain admin-session select on these returns ~0 rows site-wide.
-- Same SECURITY DEFINER + has_role pattern already used elsewhere in this
-- project (e.g. admin_list_users) - a read-only counting function, gated by
-- returning zero rows for non-admins rather than raising.

create or replace function public.admin_get_engagement_counts()
returns table(
  saved_jobs bigint,
  liked_jobs bigint,
  job_tracker_items bigint,
  saved_feed_items bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.saved_jobs),
    (select count(*) from public.liked_jobs),
    (select count(*) from public.job_tracker_items),
    (select count(*) from public.saved_feed_items)
  where public.has_role(auth.uid(), 'admin'::app_role);
$$;

comment on function public.admin_get_engagement_counts() is
  'Site-wide aggregate counts for the /admin/site-stats dashboard. Admin-only (returns zero rows otherwise) - the underlying tables have no admin RLS bypass, only owner-row policies.';

grant execute on function public.admin_get_engagement_counts() to authenticated;
