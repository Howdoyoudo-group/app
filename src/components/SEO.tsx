import { Helmet } from "react-helmet-async";

const BASE_URL = "https://www.howdoyoudo.co.uk";
const DEFAULT_TITLE = "How do you do? Unpacking the industries we love and live in";
const DEFAULT_DESC = "Unpacking the industries we love and live in - careers, jobs, courses and culture across footwear, fashion, grocery, cinema, music and more.";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg?v=5`;

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO = ({
  title,
  description = DEFAULT_DESC,
  path = "/",
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title ? `${title} | How do you do?` : DEFAULT_TITLE;
  const canonical = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD - emit each node as its own script tag (Google preference) */}
      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((node, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(node)}
          </script>
        ))}
    </Helmet>
  );
};

export default SEO;

/* ── Reusable JSON-LD helpers ── */

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "How do you do?",
  url: BASE_URL,
  logo: `${BASE_URL}/icon-192.png`,
  description: DEFAULT_DESC,
  sameAs: [],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "How do you do?",
  url: BASE_URL,
  description: DEFAULT_DESC,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/marketplace?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const breadcrumbJsonLd = (
  items: { name: string; path: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${BASE_URL}${item.path}`,
  })),
});

/** Industry page SEO description generator */
export const industryDesc = (name: string) =>
  `Unpacking ${name} - explore jobs, courses, company culture and news in the UK ${name.toLowerCase()} industry.`;

/** Role page SEO description generator */
export const roleDesc = (name: string) =>
  `Everything you need to know about ${name} roles - salary, day-to-day, skills, and live UK job listings.`;

/** Company page SEO description generator */
export const companyDesc = (name: string) =>
  `${name} company profile - culture, jobs, perks and what it's like to work there.`;

/* ── JobPosting structured data (Google Jobs rich results) ── */

interface JobLike {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  type?: string;
  workMode?: string;
  url?: string;
  scrapedAt?: string | null;
  industry?: string;
}

const employmentTypeMap: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  "Contract": "CONTRACTOR",
  "Freelance": "CONTRACTOR",
  "Internship": "INTERN",
  "Temporary": "TEMPORARY",
};

/**
 * Build a single JobPosting JSON-LD object. Returns null if the job is
 * missing fields Google requires (title, company, description).
 */
export const jobPostingJsonLd = (job: JobLike) => {
  if (!job.title || !job.company || !job.description) return null;

  const datePosted = job.scrapedAt
    ? new Date(job.scrapedAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  // JobPostings expire after 30 days unless we say otherwise - give them 60.
  const validThrough = new Date(
    new Date(datePosted).getTime() + 60 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted,
    validThrough,
    employmentType: employmentTypeMap[job.type || ""] || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "United Kingdom",
        addressCountry: "GB",
      },
    },
    directApply: false,
  };

  if (job.workMode === "Remote") {
    node.jobLocationType = "TELECOMMUTE";
    node.applicantLocationRequirements = {
      "@type": "Country",
      name: "United Kingdom",
    };
  }

  if (job.salaryMin || job.salaryMax) {
    node.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin || job.salaryMax,
        maxValue: job.salaryMax || job.salaryMin,
        unitText: "YEAR",
      },
    };
  }

  if (job.url) node.url = job.url;
  if (job.industry) node.industry = job.industry;

  return node;
};

/**
 * Build an array of JobPosting JSON-LD nodes for a list of jobs. Filters
 * out invalid entries and caps to the first `limit` jobs (default 25) to
 * keep the HTML payload sensible.
 */
export const jobPostingsJsonLd = (jobs: JobLike[], limit = 25) =>
  jobs
    .slice(0, limit)
    .map(jobPostingJsonLd)
    .filter((x): x is Record<string, unknown> => x !== null);

