-- Fix: user_interactions_interaction_type_check only allowed 4 of the 10
-- interaction types the app actually inserts (src/hooks/useTrackInteraction.ts
-- InteractionType union). save_company, save_role, save_industry,
-- marketplace_search, career_map_role_link, career_map_ncs_link have been
-- silently failing every insert since they were added - the error is
-- deliberately swallowed in trackInteraction() ("tracking must never break
-- UX"), so this went unnoticed. Confirmed live: before this fix,
-- `select interaction_type, count(*) from user_interactions group by
-- interaction_type` returned only company_view/industry_view/job_click rows -
-- zero for any of the six newer types despite the app clearly firing them.

alter table public.user_interactions
  drop constraint user_interactions_interaction_type_check;

alter table public.user_interactions
  add constraint user_interactions_interaction_type_check
  check (interaction_type in (
    'company_view','industry_view','job_click','help_apply',
    'save_company','save_role','save_industry','marketplace_search',
    'career_map_role_link','career_map_ncs_link'
  ));
