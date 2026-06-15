-- Deduplicate role_skills for social-media-coordinator.
-- 73 rows → 30 clean, distinct skills (43 duplicates removed).
--
-- Keepers by domain:
-- Business and Administration (6): Adaptability & Flexibility, Effective Written Communication,
--   Organisation & Time Management, Attention to Detail, Proactive Learning, Cross-functional Collaboration
-- Creative and Design (3): Visual Content Design, Creativity & Innovation, Basic Graphic Design
-- Digital (7): Social Media Platform Management, Social Media Platform Expertise,
--   Social Media Platform Algorithms, Social Media Analytics & Reporting,
--   Visual Content Editing, Social Media Trend Awareness, SEO for Social Media
-- Legal (1): Copyright & Data Protection (GDPR)
-- Sales/Marketing (13): Social Media Content Creation, Community Engagement & Moderation,
--   Social Media Strategy Contribution, Digital Marketing Campaign Management,
--   Digital Marketing Fundamentals, Trend Monitoring & Adaptation,
--   Copywriting for Social Media, Content Calendar Management,
--   Brand Voice & Consistency, Paid Social Media Advertising,
--   Social Media Crisis Management, Audience Research & Targeting,
--   Brand Voice & Tone Guidelines

DELETE FROM user_skill_ratings WHERE skill_id IN (
  -- Business & Admin dupes
  '6ca95caf-2837-475d-aa54-62d14da67f6c', -- Adaptability (bare dupe)
  '812f38ce-1d6a-4941-afc8-b924f1bc3256', -- Time Management & Organisation (dupe of Organisation & Time Management)
  '2cd4f11a-4282-4437-8441-6fcdcfdf967a', -- Communication Skills (vague, covered by Effective Written Communication)
  'e3a5a0c5-2e10-42df-8e80-74b5b56e88ab', -- Effective Communication (behaviour dupe)
  'be0be1c7-3870-4e26-bb4f-26c5c4d42362', -- Customer Service Orientation (not core for SMC)
  '838ec216-2523-4b7b-a1a2-90b4ec20c6cd', -- Team Collaboration (dupe of Cross-functional Collaboration)
  -- Creative & Design dupes
  '0329740a-86f4-4144-a1ae-a6cb5c8fdc8f', -- Digital Content Creation (dupe of Social Media Content Creation)
  '283e0b0c-d4ec-43d4-a6bd-a997dd1b1e84', -- Basic Graphic Design (Social Media) (dupe)
  '66a50d91-be0d-486b-ba56-93b49dd0bf1a', -- Copywriting (dupe of Copywriting for Social Media)
  '160065ca-49fb-49aa-842a-ad39f039522e', -- Digital Copywriting (dupe)
  'ce1bdcee-5c6a-4b9b-a365-47247ff9a1f3', -- Visual Content Design (Basic) (dupe of Visual Content Design)
  '1b946ee7-a653-4ef5-92f7-404030e2d259', -- Creative Thinking (dupe of Creativity & Innovation)
  '6c3e3257-b7b0-4892-8b5c-acfa373b5f6f', -- Basic Visual Content Editing (dupe of Visual Content Editing)
  '85d08a2b-67cd-453a-80a9-7b787b1881d8', -- Basic Graphic Design & Video Editing (covered by separate skills)
  -- Digital dupes
  '7621412a-7471-4c7d-a8f9-229a5a11d267', -- Content Creation (Visual & Text) (dupe of Social Media Content Creation)
  '88e639f5-0f41-4b12-b9fe-b5637ca6228b', -- Social Media Platform Knowledge (dupe of Expertise)
  '6d0fc975-7d87-4361-840c-684245c0df63', -- Digital Trend Awareness (dupe of Social Media Trend Awareness)
  '2d6de21e-f3ee-45fc-96d0-568ca792304a', -- Proactivity & Trend Awareness (dupe)
  '8ee1924b-5e3c-4b3b-adcc-b6936beac21b', -- Basic Social SEO (dupe of SEO for Social Media)
  '5520df1b-ee58-4424-a792-96cbef033d13', -- Adaptability to Digital Changes (dupe of Adaptability & Flexibility)
  'cf9ee38a-bb65-4cb1-a92f-3dfe4931234b', -- SEO Fundamentals (dupe of SEO for Social Media)
  '668c1c70-f55a-4e5b-8e2f-833f55c375b0', -- Basic SEO for Social Media (dupe)
  -- Legal dupes
  'b6af8150-4137-4126-9a11-e821fb88f703', -- UK Digital Regulations (dupe of Copyright & Data Protection)
  'f455ea54-f3f9-4072-a155-9f726b45e733', -- GDPR & Data Privacy Awareness (dupe)
  -- Sales/Marketing dupes
  'c711c1c2-5a4f-42c3-9b74-fb22ac1713df', -- Content Creation (too vague)
  '395f82eb-e9e5-4f2c-90df-22579ddf3f88', -- Content Creation & Curation (dupe)
  'b3cc2a55-f506-428c-97aa-cbda9a3c1ff1', -- Engaging Copywriting (dupe of Copywriting for Social Media)
  '02a4f086-fb2a-41e5-b685-53ae45f4d547', -- Community Engagement (behaviour dupe of skill version)
  'bc79ec10-870e-4b9d-86ca-9adfd77d0ab8', -- Social Media Analytics (dupe of Analytics & Reporting in Digital)
  'db345f31-3780-4b62-ab09-1cd55abbd249', -- Digital Marketing Strategy (dupe of Digital Marketing Fundamentals)
  'a0e008df-75c6-4cf4-a0e4-423eb41b9f76', -- Online Community Engagement (dupe)
  '2ca0e036-e614-4c82-9543-2d0951b6bcd4', -- Digital Marketing Principles (dupe of Fundamentals)
  '3451a0f8-17b5-4596-8ebf-08acf00bb24f', -- Brand Voice & Messaging (dupe of Brand Voice & Tone Guidelines)
  '923ca6a0-121c-4b77-8a0b-641c323cadbe', -- UK Social Media Trends (dupe of Social Media Trend Awareness)
  '20228a4d-dafc-4395-a772-783395d71b40', -- Social Media Trend Monitoring (dupe of Trend Monitoring & Adaptation)
  'c753690e-a9b7-4396-b536-efa2860bb4d4', -- Copyright & GDPR Compliance (dupe of Copyright & Data Protection)
  '3fe24b56-38c7-4f6b-85f3-54059d16e426', -- Brand Voice Consistency (dupe of Brand Voice & Consistency behaviour)
  'a849c1ca-7f61-4d15-893b-caa9bb661424', -- Crisis Communication (dupe of Social Media Crisis Management)
  '7228266b-2277-49cf-92ce-a672516c7d81', -- Content Strategy Development (dupe of Social Media Strategy Contribution)
  'ccf871b8-ddb9-4308-a0b2-ed90231ed998', -- Brand Voice & Guidelines Adherence (dupe of Brand Voice & Tone Guidelines)
  '9adc62df-ddd8-434f-a1cf-1a38938525b4', -- Brand Voice Adherence (dupe)
  'bf6e85c2-d15f-4605-b5ac-6615ddc6edbb', -- Paid Social Advertising Basics (dupe of Paid Social Media Advertising)
  '54e61bfe-ef73-44a1-97f9-8821415c430b'  -- Paid Social Campaign Basics (dupe)
);

DELETE FROM role_skills WHERE id IN (
  '6ca95caf-2837-475d-aa54-62d14da67f6c',
  '812f38ce-1d6a-4941-afc8-b924f1bc3256',
  '2cd4f11a-4282-4437-8441-6fcdcfdf967a',
  'e3a5a0c5-2e10-42df-8e80-74b5b56e88ab',
  'be0be1c7-3870-4e26-bb4f-26c5c4d42362',
  '838ec216-2523-4b7b-a1a2-90b4ec20c6cd',
  '0329740a-86f4-4144-a1ae-a6cb5c8fdc8f',
  '283e0b0c-d4ec-43d4-a6bd-a997dd1b1e84',
  '66a50d91-be0d-486b-ba56-93b49dd0bf1a',
  '160065ca-49fb-49aa-842a-ad39f039522e',
  'ce1bdcee-5c6a-4b9b-a365-47247ff9a1f3',
  '1b946ee7-a653-4ef5-92f7-404030e2d259',
  '6c3e3257-b7b0-4892-8b5c-acfa373b5f6f',
  '85d08a2b-67cd-453a-80a9-7b787b1881d8',
  '7621412a-7471-4c7d-a8f9-229a5a11d267',
  '88e639f5-0f41-4b12-b9fe-b5637ca6228b',
  '6d0fc975-7d87-4361-840c-684245c0df63',
  '2d6de21e-f3ee-45fc-96d0-568ca792304a',
  '8ee1924b-5e3c-4b3b-adcc-b6936beac21b',
  '5520df1b-ee58-4424-a792-96cbef033d13',
  'cf9ee38a-bb65-4cb1-a92f-3dfe4931234b',
  '668c1c70-f55a-4e5b-8e2f-833f55c375b0',
  'b6af8150-4137-4126-9a11-e821fb88f703',
  'f455ea54-f3f9-4072-a155-9f726b45e733',
  'c711c1c2-5a4f-42c3-9b74-fb22ac1713df',
  '395f82eb-e9e5-4f2c-90df-22579ddf3f88',
  'b3cc2a55-f506-428c-97aa-cbda9a3c1ff1',
  '02a4f086-fb2a-41e5-b685-53ae45f4d547',
  'bc79ec10-870e-4b9d-86ca-9adfd77d0ab8',
  'db345f31-3780-4b62-ab09-1cd55abbd249',
  'a0e008df-75c6-4cf4-a0e4-423eb41b9f76',
  '2ca0e036-e614-4c82-9543-2d0951b6bcd4',
  '3451a0f8-17b5-4596-8ebf-08acf00bb24f',
  '923ca6a0-121c-4b77-8a0b-641c323cadbe',
  '20228a4d-dafc-4395-a772-783395d71b40',
  'c753690e-a9b7-4396-b536-efa2860bb4d4',
  '3fe24b56-38c7-4f6b-85f3-54059d16e426',
  'a849c1ca-7f61-4d15-893b-caa9bb661424',
  '7228266b-2277-49cf-92ce-a672516c7d81',
  'ccf871b8-ddb9-4308-a0b2-ed90231ed998',
  '9adc62df-ddd8-434f-a1cf-1a38938525b4',
  'bf6e85c2-d15f-4605-b5ac-6615ddc6edbb',
  '54e61bfe-ef73-44a1-97f9-8821415c430b'
);
