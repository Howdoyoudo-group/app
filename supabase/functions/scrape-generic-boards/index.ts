// Generic scraper for curated UK job boards.
//
// Each entry defines a board (URL pattern, industry, expected job-URL regex,
// fallback company name). Firecrawl pulls the listing page; we extract via a
// JSON prompt + raw link backfill, apply a UK-relevance filter, and upsert
// into `jobs`.
//
// Designed to run weekly via pg_cron with no payload required.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BoardSource {
  key: string;
  url: string;
  industry: string;
  fallbackCompany: string;
  jobUrlPattern: RegExp;
  tags: string[];
  // If true, skip UK-relevance filter (board is already UK-only).
  ukOnly: boolean;
}

// Build NHS Jobs board entries - sweep across job families, regions, and pagination
// to capture the breadth of jobs.nhs.uk (25k+ live vacancies at any one time).
const NHS_KEYWORDS = [
  '', // empty = all jobs (page 1, 2, 3...)
  'nurse', 'doctor', 'consultant', 'gp', 'midwife', 'paramedic',
  'healthcare assistant', 'support worker', 'care assistant',
  'physiotherapist', 'occupational therapist', 'radiographer', 'sonographer',
  'pharmacist', 'dietitian', 'speech therapist', 'psychologist', 'psychotherapist',
  'mental health', 'community nurse', 'district nurse', 'health visitor',
  'social worker', 'porter', 'cleaner', 'catering', 'estates',
  'administrator', 'receptionist', 'medical secretary', 'finance', 'hr',
  'data analyst', 'informatics', 'digital', 'project manager', 'programme manager',
  'clinical', 'biomedical scientist', 'laboratory', 'pathology',
  'apprentice', 'trainee', 'graduate', 'band 2', 'band 3', 'band 4', 'band 5', 'band 6', 'band 7', 'band 8',
];
const NHS_PAGES_PER_KEYWORD = 3;
const nhsBoards: BoardSource[] = [];
for (const kw of NHS_KEYWORDS) {
  for (let page = 1; page <= NHS_PAGES_PER_KEYWORD; page++) {
    const params = new URLSearchParams({ language: 'en', page: String(page) });
    if (kw) params.set('keyword', kw);
    const slug = (kw || 'all').replace(/\s+/g, '-');
    nhsBoards.push({
      key: `nhs-jobs-${slug}-p${page}`,
      url: `https://www.jobs.nhs.uk/candidate/search/results?${params.toString()}`,
      industry: 'health',
      fallbackCompany: 'NHS',
      jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
      tags: ['Health', 'NHS'],
      ukOnly: true,
    });
  }
}

const BOARDS: BoardSource[] = [
  // ===== Health - NHS (sweep) =====
  ...nhsBoards,
  {
    key: 'nhs-scotland',
    url: 'https://jobs.scot.nhs.uk/Vacancies.aspx',
    industry: 'health',
    fallbackCompany: 'NHS Scotland',
    jobUrlPattern: /jobs\.scot\.nhs\.uk\/.*(VacancyDetail|JobDetail|Vacancies)/i,
    tags: ['Health', 'NHS Scotland'],
    ukOnly: true,
  },
  {
    key: 'nhs-wales-trac',
    url: 'https://jobs.nhs.wales/jobs/',
    industry: 'health',
    fallbackCompany: 'NHS Wales',
    jobUrlPattern: /jobs\.nhs\.wales\/(jobs|job)\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS Wales'],
    ukOnly: true,
  },
  {
    key: 'hsc-northern-ireland',
    url: 'https://jobs.hscni.net/Jobs',
    industry: 'health',
    fallbackCompany: 'HSC Northern Ireland',
    jobUrlPattern: /hscni\.net\/Job(s)?\/[A-Za-z0-9\-]+/i,
    tags: ['Health', 'HSC NI'],
    ukOnly: true,
  },
  // Major NHS trusts that run direct ATS-style portals (Trac/Civica) under jobs.nhs.uk -
  // listing the trust filter pages catches roles that bury under generic search pagination.
  {
    key: 'nhs-trust-gosh',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=Great+Ormond+Street+Hospital+for+Children+NHS+Foundation+Trust&language=en',
    industry: 'health',
    fallbackCompany: 'Great Ormond Street Hospital',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', 'GOSH'],
    ukOnly: true,
  },
  {
    key: 'nhs-trust-guys-st-thomas',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=Guy%27s+and+St+Thomas%27+NHS+Foundation+Trust&language=en',
    industry: 'health',
    fallbackCompany: "Guy's and St Thomas' NHS Foundation Trust",
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', "Guy's & St Thomas'"],
    ukOnly: true,
  },
  {
    key: 'nhs-trust-barts',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=Barts+Health+NHS+Trust&language=en',
    industry: 'health',
    fallbackCompany: 'Barts Health NHS Trust',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', 'Barts'],
    ukOnly: true,
  },
  {
    key: 'nhs-trust-imperial',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=Imperial+College+Healthcare+NHS+Trust&language=en',
    industry: 'health',
    fallbackCompany: 'Imperial College Healthcare NHS Trust',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', 'Imperial'],
    ukOnly: true,
  },
  {
    key: 'nhs-trust-uclh',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=University+College+London+Hospitals+NHS+Foundation+Trust&language=en',
    industry: 'health',
    fallbackCompany: 'UCLH',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', 'UCLH'],
    ukOnly: true,
  },
  {
    key: 'nhs-trust-manchester',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=Manchester+University+NHS+Foundation+Trust&language=en',
    industry: 'health',
    fallbackCompany: 'Manchester University NHS Foundation Trust',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', 'Manchester'],
    ukOnly: true,
  },
  {
    key: 'nhs-trust-leeds',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=Leeds+Teaching+Hospitals+NHS+Trust&language=en',
    industry: 'health',
    fallbackCompany: 'Leeds Teaching Hospitals NHS Trust',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', 'Leeds'],
    ukOnly: true,
  },
  {
    key: 'nhs-trust-birmingham',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=University+Hospitals+Birmingham+NHS+Foundation+Trust&language=en',
    industry: 'health',
    fallbackCompany: 'University Hospitals Birmingham NHS FT',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS', 'Birmingham'],
    ukOnly: true,
  },
  {
    key: 'nhs-england-careers',
    url: 'https://www.jobs.nhs.uk/candidate/search/results?employer=NHS+England&language=en',
    industry: 'health',
    fallbackCompany: 'NHS England',
    jobUrlPattern: /jobs\.nhs\.uk\/candidate\/vacancy\/[a-z0-9\-]+/i,
    tags: ['Health', 'NHS England'],
    ukOnly: true,
  },
  // ===== Horse Racing =====
  {
    key: 'careers-in-racing',
    url: 'https://www.careersinracing.com/find-a-job/job-search',
    industry: 'horse-racing',
    fallbackCompany: 'Careers in Racing',
    jobUrlPattern: /careersinracing\.com\/.*(job|vacancy|search)/i,
    tags: ['Horse Racing', 'Careers in Racing'],
    ukOnly: true,
  },
  {
    key: 'bha-careers',
    url: 'https://www.britishhorseracing.com/inside-horseracing/careers/',
    industry: 'horse-racing',
    fallbackCompany: 'British Horseracing Authority',
    jobUrlPattern: /britishhorseracing\.com\/.*(career|vacancy|job)/i,
    tags: ['Horse Racing', 'BHA'],
    ukOnly: true,
  },
  {
    key: 'racing-post-jobs',
    url: 'https://www.racingpost.com/jobs/',
    industry: 'horse-racing',
    fallbackCompany: 'Racing Post Jobs',
    jobUrlPattern: /racingpost\.com\/jobs\/[a-z0-9\-]+/i,
    tags: ['Horse Racing', 'Racing Post'],
    ukOnly: true,
  },
  // ===== Farming =====
  {
    key: 'farmers-weekly',
    url: 'https://jobs.fwi.co.uk',
    industry: 'farming',
    fallbackCompany: 'Farmers Weekly Jobs',
    jobUrlPattern: /jobs\.fwi\.co\.uk\/job\/[a-z0-9\-]+/i,
    tags: ['Farming', 'Agriculture'],
    ukOnly: true,
  },
  {
    key: 'agricultural-jobs',
    url: 'https://www.agrifj.co.uk/jobs/',
    industry: 'farming',
    fallbackCompany: 'Agricultural & Farming Jobs',
    jobUrlPattern: /agrifj\.co\.uk\/jobs?\/[a-z0-9\-]+/i,
    tags: ['Farming', 'Agriculture'],
    ukOnly: true,
  },
  // ===== Money / Finance =====
  {
    key: 'efinancial-careers',
    url: 'https://www.efinancialcareers.co.uk/jobs',
    industry: 'money',
    fallbackCompany: 'eFinancialCareers',
    jobUrlPattern: /efinancialcareers\.co\.uk\/jobs\/[a-z0-9\-]+/i,
    tags: ['Money', 'Finance'],
    ukOnly: true,
  },
  {
    key: 'cityjobs',
    url: 'https://www.cityjobs.com/jobs/uk/',
    industry: 'money',
    fallbackCompany: 'CityJobs',
    jobUrlPattern: /cityjobs\.com\/.*(job|vacancy)\/[a-z0-9\-]+/i,
    tags: ['Money', 'Finance'],
    ukOnly: true,
  },

  {
    key: 'caterer',
    url: 'https://www.caterer.com/jobs/in-uk?radius=5&searchOrigin=Resultlist_top-search',
    industry: 'hospitality',
    fallbackCompany: 'Caterer.com',
    jobUrlPattern: /caterer\.com\/job\/[a-z0-9-]+\/?/i,
    tags: ['Hospitality', 'Food & Drink'],
    ukOnly: true,
  },
  // Caterer.com keyword sweeps - the generic /jobs/in-uk page misses
  // role-specific listings (baker, pastry, bakery assistant) that are
  // surfaced via /jobs/<keyword>/in-uk deep-link pages.
  {
    key: 'caterer-baker',
    url: 'https://www.caterer.com/jobs/baker/in-uk',
    industry: 'food-drink',
    fallbackCompany: 'Caterer.com',
    jobUrlPattern: /caterer\.com\/job\/[a-z0-9-]+\/?/i,
    tags: ['Food & Drink', 'Bakery', 'Role: Baker'],
    ukOnly: true,
  },
  {
    key: 'caterer-pastry-chef',
    url: 'https://www.caterer.com/jobs/pastry-chef/in-uk',
    industry: 'food-drink',
    fallbackCompany: 'Caterer.com',
    jobUrlPattern: /caterer\.com\/job\/[a-z0-9-]+\/?/i,
    tags: ['Food & Drink', 'Bakery', 'Role: Pastry Chef'],
    ukOnly: true,
  },
  {
    key: 'caterer-bakery-assistant',
    url: 'https://www.caterer.com/jobs/bakery-assistant/in-uk',
    industry: 'food-drink',
    fallbackCompany: 'Caterer.com',
    jobUrlPattern: /caterer\.com\/job\/[a-z0-9-]+\/?/i,
    tags: ['Food & Drink', 'Bakery', 'Entry-level'],
    ukOnly: true,
  },
  {
    key: 'caterer-head-chef',
    url: 'https://www.caterer.com/jobs/head-chef/in-uk',
    industry: 'hospitality',
    fallbackCompany: 'Caterer.com',
    jobUrlPattern: /caterer\.com\/job\/[a-z0-9-]+\/?/i,
    tags: ['Hospitality', 'Role: Head Chef'],
    ukOnly: true,
  },
  // SimplyHired UK - aggregator (Indeed-owned) that surfaces long-tail
  // entry-level / part-time bakery roles other sources skip. One Firecrawl
  // credit per query/page; keep the keyword set tight.
  {
    key: 'simplyhired-bakery-london',
    url: 'https://www.simplyhired.co.uk/search?q=bakery&l=london',
    industry: 'food-drink',
    fallbackCompany: 'SimplyHired',
    jobUrlPattern: /simplyhired\.co\.uk\/job\/[A-Za-z0-9_\-]+/i,
    tags: ['Food & Drink', 'Bakery'],
    ukOnly: true,
  },
  {
    key: 'simplyhired-bakery-uk',
    url: 'https://www.simplyhired.co.uk/search?q=bakery&l=united+kingdom',
    industry: 'food-drink',
    fallbackCompany: 'SimplyHired',
    jobUrlPattern: /simplyhired\.co\.uk\/job\/[A-Za-z0-9_\-]+/i,
    tags: ['Food & Drink', 'Bakery'],
    ukOnly: true,
  },
  {
    key: 'simplyhired-bakery-no-experience',
    url: 'https://www.simplyhired.co.uk/search?q=no+experience+part+time+bakery&l=london',
    industry: 'food-drink',
    fallbackCompany: 'SimplyHired',
    jobUrlPattern: /simplyhired\.co\.uk\/job\/[A-Za-z0-9_\-]+/i,
    tags: ['Food & Drink', 'Bakery', 'Entry-level'],
    ukOnly: true,
  },
  {
    key: 'simplyhired-baker-uk',
    url: 'https://www.simplyhired.co.uk/search?q=baker&l=united+kingdom',
    industry: 'food-drink',
    fallbackCompany: 'SimplyHired',
    jobUrlPattern: /simplyhired\.co\.uk\/job\/[A-Za-z0-9_\-]+/i,
    tags: ['Food & Drink', 'Bakery', 'Role: Baker'],
    ukOnly: true,
  },
  {
    key: 'grapevine',
    url: 'https://www.grapevinejobs.co.uk/jobs-in-media-broadcast-tv-video-post-production',
    industry: 'cinema',
    fallbackCompany: 'Grapevine Jobs',
    jobUrlPattern: /grapevinejobs\.co\.uk\/job(s)?\/[a-z0-9\-_/]+/i,
    tags: ['Film & TV', 'Broadcast'],
    ukOnly: true,
  },
  {
    key: 'bfi',
    url: 'https://bfijobsandopportunities.bfi.org.uk',
    industry: 'cinema',
    fallbackCompany: 'BFI',
    jobUrlPattern: /bfi\.org\.uk\/.*\/(job|opportunit)/i,
    tags: ['Film & TV', 'BFI'],
    ukOnly: true,
  },
  {
    key: 'myfirstjobinfilm',
    url: 'https://myfirstjobinfilm.com/UK',
    industry: 'cinema',
    fallbackCompany: 'My First Job in Film',
    jobUrlPattern: /myfirstjobinfilm\.com\/.*(job|listing|vacancy)/i,
    tags: ['Film & TV', 'Entry-level'],
    ukOnly: true,
  },
  {
    key: 'productionguild',
    url: 'https://productionguild.com/member-resources/job-opportunities/',
    industry: 'cinema',
    fallbackCompany: 'Production Guild',
    jobUrlPattern: /productionguild\.com\/.*(job|opportunit)/i,
    tags: ['Film & TV', 'Production'],
    ukOnly: true,
  },
  {
    key: 'creativeaccess',
    url: 'https://opportunities.creativeaccess.org.uk/jobs/film-tv-radio-audio',
    industry: 'cinema',
    fallbackCompany: 'Creative Access',
    jobUrlPattern: /creativeaccess\.org\.uk\/.*(job|vacancy|listing)/i,
    tags: ['Film & TV', 'Diversity'],
    ukOnly: true,
  },
  {
    key: 'thedots',
    url: 'https://the-dots.com/jobs/search/film-jobs',
    industry: 'cinema',
    fallbackCompany: 'The Dots',
    jobUrlPattern: /the-dots\.com\/jobs?\/[a-z0-9\-]+/i,
    tags: ['Film & TV', 'Creative'],
    ukOnly: true,
  },

  // ===== Building / Construction =====
  { key: 'balfour-beatty-careers', url: 'https://www.balfourbeatty.com/careers/search-jobs/', industry: 'building', fallbackCompany: 'Balfour Beatty', jobUrlPattern: /balfourbeatty\.com\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: false },
  { key: 'kier-careers', url: 'https://www.kier.co.uk/careers/search-jobs/', industry: 'building', fallbackCompany: 'Kier Group', jobUrlPattern: /kier\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: true },
  { key: 'mace-careers', url: 'https://www.macegroup.com/careers/current-vacancies', industry: 'building', fallbackCompany: 'Mace', jobUrlPattern: /macegroup\.com\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: false },
  { key: 'morgan-sindall-careers', url: 'https://www.morgansindall.com/careers/current-vacancies', industry: 'building', fallbackCompany: 'Morgan Sindall', jobUrlPattern: /morgansindall\.com\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: true },
  { key: 'persimmon-careers', url: 'https://www.persimmonhomes.com/corporate/careers/current-vacancies', industry: 'building', fallbackCompany: 'Persimmon', jobUrlPattern: /persimmonhomes\.com\/.*(job|career|vacanc)/i, tags: ['Building', 'Housebuilding'], ukOnly: true },
  { key: 'taylor-wimpey-careers', url: 'https://www.taylorwimpey.co.uk/careers/search-for-a-role', industry: 'building', fallbackCompany: 'Taylor Wimpey', jobUrlPattern: /taylorwimpey\.co\.uk\/.*(job|career|role|vacanc)/i, tags: ['Building', 'Housebuilding'], ukOnly: true },
  { key: 'willmott-dixon-careers', url: 'https://www.willmottdixon.co.uk/careers/current-vacancies', industry: 'building', fallbackCompany: 'Willmott Dixon', jobUrlPattern: /willmottdixon\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: true },
  { key: 'wates-careers', url: 'https://www.wates.co.uk/careers/current-vacancies', industry: 'building', fallbackCompany: 'Wates Group', jobUrlPattern: /wates\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: true },
  { key: 'laing-orourke-careers', url: 'https://www.laingorourke.com/careers/current-vacancies/', industry: 'building', fallbackCompany: "Laing O'Rourke", jobUrlPattern: /laingorourke\.com\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: false },
  { key: 'vistry-careers', url: 'https://www.vistrygroup.co.uk/careers/search', industry: 'building', fallbackCompany: 'Vistry Group', jobUrlPattern: /vistrygroup\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Building', 'Housebuilding'], ukOnly: true },
  { key: 'galliford-try-careers', url: 'https://www.gallifordtry.co.uk/careers/vacancies/', industry: 'building', fallbackCompany: 'Galliford Try', jobUrlPattern: /gallifordtry\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Building', 'Construction'], ukOnly: true },

  // ===== Fixing / Trades =====
  { key: 'centrica-careers', url: 'https://www.centrica.com/people-careers/search-jobs/', industry: 'fixing', fallbackCompany: 'British Gas (Centrica)', jobUrlPattern: /centrica\.com\/.*(job|career|vacanc)/i, tags: ['Fixing', 'Trades'], ukOnly: false },
  { key: 'homeserve-careers', url: 'https://homeserve.com/uk/careers-hub', industry: 'fixing', fallbackCompany: 'HomeServe', jobUrlPattern: /homeserve\.com\/.*(job|career|vacanc)/i, tags: ['Fixing', 'Trades'], ukOnly: false },
  { key: 'mitie-careers', url: 'https://www.mitie.com/careers/our-vacancies/', industry: 'fixing', fallbackCompany: 'Mitie', jobUrlPattern: /mitie\.com\/.*(job|career|vacanc)/i, tags: ['Fixing', 'FM'], ukOnly: false },
  { key: 'currys-careers', url: 'https://www.currys.co.uk/careers', industry: 'fixing', fallbackCompany: 'Currys (Geek Squad)', jobUrlPattern: /currys\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Fixing', 'Tech Repair'], ukOnly: true },
  { key: 'ismash-careers', url: 'https://www.ismash.co.uk/careers', industry: 'fixing', fallbackCompany: 'iSmash', jobUrlPattern: /ismash\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Fixing', 'Tech Repair'], ukOnly: true },
  { key: 'pimlico-plumbers-careers', url: 'https://www.pimlicoplumbers.com/careers', industry: 'fixing', fallbackCompany: 'Pimlico Plumbers', jobUrlPattern: /pimlicoplumbers\.com\/.*(job|career|vacanc)/i, tags: ['Fixing', 'Plumbing'], ukOnly: true },

  // ===== Delivery / Logistics =====
  { key: 'dpd-careers', url: 'https://jobs.dpd.co.uk', industry: 'delivery', fallbackCompany: 'DPD', jobUrlPattern: /jobs\.dpd\.co\.uk\/.*(job|vacanc|role)/i, tags: ['Delivery', 'Logistics'], ukOnly: true },
  { key: 'evri-careers', url: 'https://www.evri.com/about/careers', industry: 'delivery', fallbackCompany: 'Evri', jobUrlPattern: /evri\.com\/.*(job|career|vacanc)/i, tags: ['Delivery', 'Courier'], ukOnly: true },
  { key: 'yodel-careers', url: 'https://jobs.yodel.co.uk', industry: 'delivery', fallbackCompany: 'Yodel', jobUrlPattern: /jobs\.yodel\.co\.uk\/.*(job|vacanc|role)/i, tags: ['Delivery', 'Courier'], ukOnly: true },
  { key: 'royal-mail-careers', url: 'https://jobs.royalmail.com', industry: 'delivery', fallbackCompany: 'Royal Mail', jobUrlPattern: /royalmail\.com\/.*(job|career|vacanc)/i, tags: ['Delivery', 'Postal'], ukOnly: true },
  { key: 'wincanton-careers', url: 'https://www.wincanton.co.uk/careers/vacancies/', industry: 'delivery', fallbackCompany: 'Wincanton', jobUrlPattern: /wincanton\.co\.uk\/.*(job|career|vacanc)/i, tags: ['Delivery', 'Logistics'], ukOnly: true },
  { key: 'dhl-supply-chain-careers', url: 'https://careers.dhl.com/gb/en/jobs', industry: 'delivery', fallbackCompany: 'DHL Supply Chain', jobUrlPattern: /careers\.dhl\.com\/.*(job|role|vacanc)/i, tags: ['Delivery', 'Logistics'], ukOnly: false },
  { key: 'xpo-logistics-careers', url: 'https://jobs.xpo.com/gb/en', industry: 'delivery', fallbackCompany: 'XPO Logistics', jobUrlPattern: /jobs\.xpo\.com\/.*(job|career|vacanc)/i, tags: ['Delivery', 'Logistics'], ukOnly: false },
];

interface ExtractedJob {
  title: string;
  url: string;
  company?: string | null;
  location?: string | null;
  type?: string | null;
  description?: string | null;
}

const STRUCTURED_PROMPT = `Extract every job listing on this page. For each job include:
- title (exact wording from the listing heading)
- url (absolute URL to the job detail page)
- company (the hiring organisation if shown)
- location (city/region as displayed)
- type (Full time / Part time / Contract / Freelance etc. if shown)
- description (first 1-2 sentences of the listing summary)
Ignore navigation, search filters, category counts, pagination and ads.
Return JSON: {"jobs":[{"title":"...","url":"...","company":"...","location":"...","type":"...","description":"..."}]}`;

const US_STATE_RE = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/;

function absUrl(href: string, base: string): string {
  try { return new URL(href, base).toString(); } catch { return href; }
}

function isUkRelevant(job: ExtractedJob, ukOnly: boolean): boolean {
  if (ukOnly) return true;
  const loc = (job.location ?? '').trim();
  if (loc && /,\s*[A-Z]{2}$/.test(loc) && US_STATE_RE.test(loc)) return false;
  return true;
}

function normalize(raw: any, board: BoardSource): ExtractedJob | null {
  if (!raw || typeof raw !== 'object') return null;
  const title = String(raw.title ?? '').trim();
  const rawUrl = String(raw.url ?? raw.link ?? raw.href ?? '').trim();
  if (!title || !rawUrl || title.length < 4) return null;
  const url = absUrl(rawUrl, board.url);
  if (!board.jobUrlPattern.test(url)) return null;
  return {
    title,
    url,
    company: raw.company ? String(raw.company).trim() : null,
    location: raw.location ? String(raw.location).trim() : null,
    type: raw.type ? String(raw.type).trim() : null,
    description: raw.description ? String(raw.description).trim().slice(0, 1000) : null,
  };
}

async function scrapeBoard(board: BoardSource, apiKey: string): Promise<ExtractedJob[]> {
  const resp = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: board.url,
      formats: [{ type: 'json', prompt: STRUCTURED_PROMPT }, 'links'],
      onlyMainContent: true,
      waitFor: 3000,
    }),
  });
  if (!resp.ok) {
    console.warn(`[scrape-generic-boards] ${board.key} failed: ${resp.status}`);
    return [];
  }
  const data = await resp.json();
  const structured = data?.data?.json ?? data?.json ?? null;
  const links: string[] = data?.data?.links ?? data?.links ?? [];

  const out: ExtractedJob[] = [];
  if (structured && Array.isArray(structured.jobs)) {
    for (const j of structured.jobs) {
      const norm = normalize(j, board);
      if (norm) out.push(norm);
    }
  }

  // Backfill from raw links.
  const seen = new Set(out.map((j) => j.url));
  for (const link of links) {
    const url = absUrl(link, board.url);
    if (!board.jobUrlPattern.test(url) || seen.has(url)) continue;
    const slug = url.replace(/\/$/, '').split('/').pop() ?? '';
    const title = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
    if (title.length < 4) continue;
    seen.add(url);
    out.push({ title, url, company: null, location: null, type: null, description: null });
  }

  // Dedupe within board.
  const uniq = new Map<string, ExtractedJob>();
  for (const j of out) {
    const k = j.url.toLowerCase();
    if (!uniq.has(k)) uniq.set(k, j);
  }
  return Array.from(uniq.values());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!apiKey || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing env vars' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const requestedKeys: string[] = Array.isArray(body?.boards) ? body.boards : [];
    const targets = requestedKeys.length
      ? BOARDS.filter((b) => requestedKeys.includes(b.key))
      : BOARDS;

    let totalFound = 0;
    let totalInserted = 0;
    const stats: Array<{ board: string; found: number; inserted: number; error?: string }> = [];

    for (const board of targets) {
      try {
        const jobs = (await scrapeBoard(board, apiKey)).filter((j) => isUkRelevant(j, board.ukOnly));
        totalFound += jobs.length;
        console.log(`[scrape-generic-boards] ${board.key}: ${jobs.length} jobs found`);

        if (jobs.length === 0) {
          stats.push({ board: board.key, found: 0, inserted: 0 });
          continue;
        }

        const urls = jobs.map((j) => j.url);
        const { data: existing } = await supabase.from('jobs').select('url').in('url', urls);
        const existingSet = new Set((existing ?? []).map((r: any) => r.url));
        const fresh = jobs.filter((j) => !existingSet.has(j.url));

        if (fresh.length === 0) {
          stats.push({ board: board.key, found: jobs.length, inserted: 0 });
          continue;
        }

        const HOTEL_RE = /\b(hotel|hotels|concierge|front office|housekeep|night manager|duty manager|reservations|guest experience|resort)\b/i;
        const HOTEL_CO = /\b(marriott|hilton|hyatt|ihg|intercontinental|accor|radisson|premier inn|travelodge|whitbread|four seasons|claridge|savoy|dorchester|connaught|ace hotel|edition hotel|soho house|the ned|nobu hotel|rosewood|mandarin oriental|peninsula|shangri-la|kimpton|firmdale|citizenm|yotel|ennismore|hoxton)\b/i;
        const PUB_RE = /\b(pub|publican|brewery|brewer|brewing|cask ale|craft beer|taproom|cellar|head brewer)\b/i;
        const PUB_CO = /\b(brewdog|fuller'?s|young'?s|greene king|mitchells & butlers|jd wetherspoon|wetherspoon|stonegate|marston'?s|shepherd neame|adnams|beavertown|thornbridge)\b/i;
        const remapInd = (ind: string, t: string, c: string): string => {
          if (ind !== 'hospitality') return ind;
          if (HOTEL_RE.test(t) || HOTEL_CO.test(c)) return 'travel';
          if (PUB_RE.test(t) || PUB_CO.test(c)) return 'beer';
          return ind;
        };

        const rows = fresh.map((j) => {
          const co = j.company || board.fallbackCompany;
          return {
            title: j.title,
            company: co,
            location: j.location,
            description: j.description,
            url: j.url,
            tags: board.tags,
            industry: remapInd(board.industry, j.title, co),
            type: j.type ?? 'Full-time',
            work_mode: 'On-site',
            featured: false,
            source_url: board.url,
          };
        });

        const { error: insertErr, data: insertedRows } = await supabase
          .from('jobs')
          .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
          .select('id');

        if (insertErr) {
          console.error(`[scrape-generic-boards] insert ${board.key}:`, insertErr);
          stats.push({ board: board.key, found: jobs.length, inserted: 0, error: insertErr.message });
        } else {
          const inserted = insertedRows?.length ?? 0;
          totalInserted += inserted;
          stats.push({ board: board.key, found: jobs.length, inserted });
        }
      } catch (err) {
        console.error(`[scrape-generic-boards] ${board.key} error:`, err);
        stats.push({ board: board.key, found: 0, inserted: 0, error: err instanceof Error ? err.message : 'unknown' });
      }
    }

    return new Response(
      JSON.stringify({ success: true, totalFound, totalInserted, stats }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[scrape-generic-boards] fatal:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
