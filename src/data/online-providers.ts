// Shared "Online Courses" provider list, used by both CoursesSection
// (industry pages) and RoleLearnSection (role pages) so there's a single
// source of truth - each provider's URL is built from a search query, not a
// bare homepage link, so results are actually scoped to the industry/role
// being viewed rather than a generic one-size-fits-all list.

export interface OnlineProvider {
  name: string;
  note: string;
  build: (encodedQuery: string) => string;
}

export const ONLINE_PROVIDERS: OnlineProvider[] = [
  { name: "Reed Courses", note: "UK course marketplace, free + paid", build: (q) => `https://www.reed.co.uk/courses/search?keywords=${q}` },
  { name: "Coursera", note: "Top universities & companies", build: (q) => `https://www.coursera.org/search?query=${q}` },
  { name: "FutureLearn", note: "UK-led short online courses", build: (q) => `https://www.futurelearn.com/search?q=${q}` },
  { name: "Open University", note: "Free OpenLearn modules", build: (q) => `https://www.open.edu/openlearn/search-results?query=${q}` },
  { name: "edX", note: "Harvard, MIT & industry partners", build: (q) => `https://www.edx.org/search?q=${q}` },
  { name: "LinkedIn Learning", note: "Professional video courses", build: (q) => `https://www.linkedin.com/learning/search?keywords=${q}` },
  { name: "Udemy", note: "Practical, on-demand courses", build: (q) => `https://www.udemy.com/courses/search/?q=${q}` },
  { name: "learndirect", note: "UK accredited distance learning", build: (q) => `https://www.learndirect.com/search?search=${q}` },
];

/** Build the provider list with real URLs for a given free-text search query. */
export function buildOnlineProviders(queryTerm: string): Array<OnlineProvider & { url: string }> {
  const encodedQuery = encodeURIComponent(queryTerm);
  return ONLINE_PROVIDERS.map((p) => ({ ...p, url: p.build(encodedQuery) }));
}
