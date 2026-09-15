-- Persistent Howdy chat history. Previously chat state was pure client-side
-- React state (CareerAssistant.tsx), lost on every page refresh - the
-- backend only ever saw whatever the client happened to still have in
-- memory (messages.slice(-10) of the CURRENT request). This was the single
-- biggest gap against competitor AI career coaches, whose most-praised trait
-- in reviews is persistent memory of prior conversations ("Phase 2" of the
-- Howdy improvement plan - see /Users/andrewharrison/.claude/plans/zany-rolling-dahl.md).
--
-- One continuous thread per user, not a "conversations" table with multiple
-- named threads - Howdy has no UI for switching between separate
-- conversations, it's presented as one ongoing relationship, so a flat
-- append-only log per user is the right shape rather than an unused
-- conversations/threads abstraction.
create table public.howdy_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  mode text not null default 'candidate' check (mode in ('candidate', 'employer')),
  created_at timestamptz not null default now()
);

alter table public.howdy_messages enable row level security;

create policy "Users can view own howdy messages"
  on public.howdy_messages for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own howdy messages"
  on public.howdy_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Service role (career-assistant edge function) writes on the user's behalf
-- after generating each reply - covered by service_role bypassing RLS
-- entirely, same as every other table this function writes to.

create index howdy_messages_user_id_created_at_idx on public.howdy_messages (user_id, created_at desc);
