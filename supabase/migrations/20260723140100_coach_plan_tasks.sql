-- Coach Plan: a persisted, per-user checklist of concrete next steps toward
-- their active target role. Deterministic tasks (rate_skills, upload_cv,
-- take_course, build_experience, stand_out) are generated/upserted
-- client-side by src/hooks/useCoachPlan.ts from data that already exists
-- (skill ratings, CV presence, badges, courses). Howdy can also add
-- bespoke 'custom' tasks via the add_coach_task tool in career-assistant.
create table if not exists public.coach_plan_tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  role_slug     text,
  task_type     text not null,   -- rate_skills | upload_cv | take_course | build_experience | stand_out | custom
  title         text not null,
  detail        text,
  link          text,
  status        text not null default 'open' check (status in ('open','done','dismissed')),
  source        text not null default 'system' check (source in ('system','howdy')),
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

-- Deterministic (non-custom) tasks are deduped one-per-type-per-role;
-- Howdy's bespoke 'custom' tasks are excluded so multiple can coexist.
create unique index if not exists coach_plan_tasks_dedupe
  on public.coach_plan_tasks(user_id, role_slug, task_type)
  where task_type <> 'custom';

create index if not exists coach_plan_tasks_user_idx
  on public.coach_plan_tasks(user_id, status);

alter table public.coach_plan_tasks enable row level security;

create policy "Users can manage their own coach plan tasks"
  on public.coach_plan_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
