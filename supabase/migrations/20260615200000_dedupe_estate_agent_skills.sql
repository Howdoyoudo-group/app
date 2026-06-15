-- Deduplicate role_skills for trainee-estate-agent.
-- 57 rows → 25 clean, distinct skills.
-- Deletes the inferior duplicate; any user_skill_ratings referencing
-- deleted IDs are also removed to avoid orphaned rows.

-- IDs to delete (grouped by the duplicate cluster they belong to):

-- Organisation & Time Management (keep fbdc7f97) — drop bare "Organisational Skills"
-- IT Proficiency (keep f267088d "CRM, MS Office") — drop 3 near-duplicates
-- Estate Agency Process (keep 29c19cb7) — drop "Estate Agency Procedures"
-- Professionalism (keep a8af7417 "& Ethical Conduct") — drop 2 weaker versions
-- Proactiveness (keep ebffc700 "& Initiative") — drop "and Initiative" variant + "Professional Conduct"
-- Resilience/Business (keep 2bb65487 "& Adaptability") — drop "and Adaptability" variant
-- Teamwork (keep e7a64c00 "& Collaboration") — drop 2 variants
-- Problem-Solving (keep 94ab4025) — drop "Problem Solving" (no hyphen)
-- Time Management standalone (keep folded into Organisation & Time Management)
-- Digital IT dupes (both are exact dupes of Business and Admin IT skill)
-- Property Law (keep dcaea32c "& Regulations") — drop bare "Principles"
-- Communication (keep 8ceff853 "Verbal & Written") — drop 3 narrower variants
-- UK Property Market (keep 7b505fab "Fundamentals") — drop "Basics"
-- Local Area (keep f2288bab "Local Property Market Knowledge") — drop 2 vaguer variants
-- Sales Process (keep 71996812 "Estate Agency Sales Process") — drop 2 generic variants
-- Basic Negotiation (keep dad49a78 "Skills") — drop bare variant
-- Resilience/Sales (keep 33e94590 "& Persistence") — drop "and Persistence" variant
-- Proactive Approach in Sales (covered by Proactiveness & Initiative in Business and Admin)
-- Property Valuation in Sales (keep Legal domain version 0f2ec034)
-- Driving (keep 7ca9100c "Full UK Driving Licence") — drop 2 variants

DELETE FROM user_skill_ratings
WHERE skill_id IN (
  '48d9ad50-8424-49ab-9c28-da77a9975e3b', -- Organisational Skills
  '14f74c9e-ab43-4f6b-90d8-a4def1011552', -- IT System Proficiency
  '96dfcbec-3f24-4af8-94aa-7a124abbd280', -- IT Proficiency (bare)
  '01ccd805-56f4-4da6-9769-c116277b2af8', -- IT Proficiency (CRM, Office Suite)
  'd510bd5b-560c-46ff-a388-afad4934d5d6', -- Estate Agency Procedures
  'f11b45d8-b0db-452c-a6a5-be9a6d911370', -- Professionalism (bare)
  'c455d250-38e1-4abf-889b-fa8815da4ba2', -- Professionalism & Ethics
  'f313afd3-5530-48d1-b04f-79684bc9d75c', -- Proactiveness and Initiative
  '4745a7a6-85da-4b46-801f-7d767f96c27c', -- Professional Conduct
  '81b3d8e9-77cb-43fa-91a8-b8e43292005e', -- Resilience and Adaptability
  '3c000736-7107-4531-a9c6-6e2e6e6d179c', -- Teamwork and Collaboration
  'ed4f1a33-676a-46f0-8c55-255baa6d0ccd', -- Team Collaboration
  '576735d2-559e-418b-9f7c-3fee5cc0ce9e', -- Problem Solving (no hyphen)
  'e32e1de5-3d11-4971-9af4-9e5b111e1d4b', -- Time Management (standalone dupe)
  'f7172117-cda4-4327-a2ee-684157a25344', -- IT & CRM System Use (Digital dupe)
  '18f6c933-60ab-4b70-ac90-a216d8217b63', -- IT Proficiency (CRM, Email) (Digital dupe)
  '84a384fa-0941-4209-a14b-53bcfce9c0ca', -- Basic Property Law Principles
  '94f3956c-f8c0-4aa2-8b1f-164bd4a2d69a', -- Effective Communication
  'dc432e3f-fc18-49d4-b20e-b47058b9a8ab', -- Verbal Communication
  '731b010c-9751-4319-9ebb-695021596234', -- Client Communication
  '85c4fc72-ddd7-49b1-9e74-e7d1674b2c13', -- UK Property Market Basics
  '169453b1-6403-42c5-946c-e0de6ff51276', -- Local Area Knowledge
  '6ec7415c-09ce-40bf-a876-170fc0cdc4d9', -- Local Area Awareness
  '2227235c-03cd-4e7f-b34a-94afe9f2bb76', -- Property Sales Process Understanding
  'd353a20e-a66c-41c5-8dcb-76a65ee7f457', -- Sales Process Understanding
  '88cf0149-73d9-422a-9bf6-3cb92bbeada7', -- Basic Negotiation (bare)
  '8eec8398-1b8e-4c8a-9c32-b64db1e8e9be', -- Resilience and Persistence
  '2b1fe311-700b-43f7-8ee6-bccc1eefd3af', -- Proactive Approach (Sales dupe)
  '9e9343b5-8cc9-4523-ae7b-b0b87a27e2e7', -- Property Valuation Principles (Sales dupe of Legal row)
  '69af6262-d41f-4131-9159-1f274ab14242', -- Driving Ability (Sales domain dupe of Transport row)
  'cddd556c-08f5-4b3b-aead-1a73d39b5aa1', -- Valid Driving Licence
  'a482ea99-fbb3-4043-b724-0c907e1ee06d'  -- Valid UK Driving Licence
);

DELETE FROM role_skills
WHERE id IN (
  '48d9ad50-8424-49ab-9c28-da77a9975e3b',
  '14f74c9e-ab43-4f6b-90d8-a4def1011552',
  '96dfcbec-3f24-4af8-94aa-7a124abbd280',
  '01ccd805-56f4-4da6-9769-c116277b2af8',
  'd510bd5b-560c-46ff-a388-afad4934d5d6',
  'f11b45d8-b0db-452c-a6a5-be9a6d911370',
  'c455d250-38e1-4abf-889b-fa8815da4ba2',
  'f313afd3-5530-48d1-b04f-79684bc9d75c',
  '4745a7a6-85da-4b46-801f-7d767f96c27c',
  '81b3d8e9-77cb-43fa-91a8-b8e43292005e',
  '3c000736-7107-4531-a9c6-6e2e6e6d179c',
  'ed4f1a33-676a-46f0-8c55-255baa6d0ccd',
  '576735d2-559e-418b-9f7c-3fee5cc0ce9e',
  'e32e1de5-3d11-4971-9af4-9e5b111e1d4b',
  'f7172117-cda4-4327-a2ee-684157a25344',
  '18f6c933-60ab-4b70-ac90-a216d8217b63',
  '84a384fa-0941-4209-a14b-53bcfce9c0ca',
  '94f3956c-f8c0-4aa2-8b1f-164bd4a2d69a',
  'dc432e3f-fc18-49d4-b20e-b47058b9a8ab',
  '731b010c-9751-4319-9ebb-695021596234',
  '85c4fc72-ddd7-49b1-9e74-e7d1674b2c13',
  '169453b1-6403-42c5-946c-e0de6ff51276',
  '6ec7415c-09ce-40bf-a876-170fc0cdc4d9',
  '2227235c-03cd-4e7f-b34a-94afe9f2bb76',
  'd353a20e-a66c-41c5-8dcb-76a65ee7f457',
  '88cf0149-73d9-422a-9bf6-3cb92bbeada7',
  '8eec8398-1b8e-4c8a-9c32-b64db1e8e9be',
  '2b1fe311-700b-43f7-8ee6-bccc1eefd3af',
  '9e9343b5-8cc9-4523-ae7b-b0b87a27e2e7',
  '69af6262-d41f-4131-9159-1f274ab14242',
  'cddd556c-08f5-4b3b-aead-1a73d39b5aa1',
  'a482ea99-fbb3-4043-b724-0c907e1ee06d'
);

-- Remaining 25 skills for trainee-estate-agent:
-- Business and Administration (10):
--   Organisation & Time Management, IT Proficiency (CRM, MS Office),
--   Estate Agency Process Understanding, Professionalism & Ethical Conduct,
--   Proactiveness & Initiative, Resilience & Adaptability, Teamwork & Collaboration,
--   Problem-Solving, Integrity and Trustworthiness, Attention to Detail
-- Legal, Finance and Accounting (4):
--   Estate Agency Regulations, Basic Property Law & Regulations,
--   Basic AML Compliance, Basic Property Valuation Principles
-- Sales, Marketing and Procurement (9):
--   Verbal & Written Communication, Customer Service Excellence, Active Listening,
--   Basic Negotiation Skills, Estate Agency Sales Process, UK Property Market Fundamentals,
--   Local Property Market Knowledge, Resilience & Persistence, Client Empathy,
--   Customer Service Orientation
-- Transport and Logistics (1):
--   Full UK Driving Licence
