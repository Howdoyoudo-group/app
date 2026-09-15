-- Phase 3 of the Howdy improvement plan (see
-- /Users/andrewharrison/.claude/plans/zany-rolling-dahl.md): make Howdy
-- proactive. Previously the only proactive moment was a single generic
-- "what's my plan" nudge on the very first chat-open of a session - nothing
-- ever reacted to something the user actually just did (moved a job to
-- "interviewing", got an offer, etc.), despite that being exactly the kind
-- of "daily notes and prompts" competitor AI career coaches get praised for.
--
-- A Postgres trigger, not application code, so it fires no matter which
-- code path changes job_tracker_items.status (web UI today, anything else
-- later) rather than needing every future call site to remember to queue a
-- nudge itself. Template-based rather than LLM-authored for this first
-- trigger type - instant, free, and a real company/role name already reads
-- as specific and personal without needing a model call in the hot path of
-- a status update. Other trigger types (a big new job match, a curiosity-
-- score jump) can follow the same table/pattern later.
create table public.howdy_nudges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  trigger_type text not null,
  created_at timestamptz not null default now(),
  shown_at timestamptz
);

alter table public.howdy_nudges enable row level security;

create policy "Users can view own howdy nudges"
  on public.howdy_nudges for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can mark own nudges shown"
  on public.howdy_nudges for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index howdy_nudges_user_id_unshown_idx on public.howdy_nudges (user_id, shown_at);

create or replace function public.queue_tracker_status_nudge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  msg text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;
  msg := case new.status
    when 'applied' then format('Nice - I see you''ve marked %s at %s as applied. Want a hand getting ready in case they come back quickly?', new.title, new.company)
    when 'interviewing' then format('How''s it going with %s at %s? Want to run through some likely interview questions together?', new.title, new.company)
    when 'offer' then format('An offer from %s - that''s brilliant! 🎉 Want a hand thinking it through, or with negotiating?', new.company)
    when 'rejected' then format('Sorry to hear about %s at %s. Want to talk through what might help next time, or look at similar roles?', new.title, new.company)
    else null
  end;
  if msg is not null then
    insert into public.howdy_nudges (user_id, message, trigger_type)
    values (new.user_id, msg, 'tracker_status_' || new.status);
  end if;
  return new;
end;
$$;

create trigger job_tracker_status_nudge
  after update of status on public.job_tracker_items
  for each row
  execute function public.queue_tracker_status_nudge();
