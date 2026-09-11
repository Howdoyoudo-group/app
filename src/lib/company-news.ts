import { supabase } from "@/integrations/supabase/client";

export interface CompanyNewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string | null;
}

// PostgREST `or=(...)` chokes on commas, parens, slashes and quotes inside
// values - the same sanitisation MyFeed.tsx's "Companies" feed uses.
const sanitizeForFilter = (name: string) =>
  name.replace(/[(),/"']/g, " ").replace(/\s+/g, " ").trim();

/**
 * Finds recent news for a specific company within its industry, reusing the
 * same free-text title-matching approach as MyFeed.tsx's "Companies" section
 * - there's no real per-company column on articles/breaking_news, so this is
 * a best-effort match rather than an exact filter.
 */
export async function fetchCompanyNews(
  industrySlug: string,
  companyNames: string[],
  limit = 4
): Promise<CompanyNewsItem[]> {
  const safeNames = companyNames
    .map(sanitizeForFilter)
    .filter((c) => c.length >= 2 && /[A-Za-z0-9]/.test(c));
  if (safeNames.length === 0 || !industrySlug) return [];

  const orFilter = safeNames
    .map((c) =>
      c.length <= 4
        ? `title.ilike.% ${c} %,title.ilike.${c} %,title.ilike.% ${c}`
        : `title.ilike.%${c}%`
    )
    .join(",");

  const cutoff90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [newsRes, articlesRes] = await Promise.all([
    supabase
      .from("breaking_news")
      .select("id, title, source, url, fetched_at")
      .eq("industry", industrySlug)
      .gte("fetched_at", cutoff90d)
      .or(orFilter)
      .order("fetched_at", { ascending: false })
      .limit(limit * 2),
    supabase
      .from("articles")
      .select("id, title, source, url, scraped_at")
      .eq("industry", industrySlug)
      .gte("scraped_at", cutoff90d)
      .or(orFilter)
      .order("scraped_at", { ascending: false })
      .limit(limit * 2),
  ]);

  const combined: CompanyNewsItem[] = [
    ...(newsRes.data || []).map((n) => ({ id: n.id, title: n.title, source: n.source, url: n.url, publishedAt: n.fetched_at })),
    ...(articlesRes.data || []).map((a) => ({ id: a.id, title: a.title, source: a.source, url: a.url, publishedAt: a.scraped_at })),
  ];

  const seenUrls = new Set<string>();
  const deduped = combined.filter((item) => {
    if (seenUrls.has(item.url)) return false;
    seenUrls.add(item.url);
    return true;
  });

  deduped.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  return deduped.slice(0, limit);
}
