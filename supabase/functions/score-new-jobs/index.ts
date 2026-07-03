// score-new-jobs: server-side pre-scoring of job matches per user.
// Runs after each scrape (6:30am and 6:30pm UTC) to populate the
// job_matches table so the frontend can fetch a pre-ranked pool
// instead of paginating 2,000 rows and scoring everything in browser.
//
// Scoring is intentionally simplified (no RIASEC, no passions, no learned
// signals) — the browser still runs the full scoreJob() on the final pool
// for accurate display scores. This is purely about better ordering at fetch
// time so the right candidates surface before the 2,000-row limit bites.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY =
  Deno.env.get("HDYD_SERVICE_JWT") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Replicates the frontend's toSlug + INDUSTRY_INTEREST_ALIASES logic exactly.
// profile.industry_interests stores display names ("Film and TV", "Food & Drink"),
// which need converting to the job-table industry slugs ("cinema", "hospitality").
function interestToSlugs(name: string): string[] {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const aliases: Record<string, string[]> = {
    "food-drink": ["hospitality", "coffee", "bakery", "beer"],
    "food-and-drink": ["hospitality", "coffee", "bakery", "beer"],
  };
  return aliases[slug] ?? [slug];
}

function freshnessPoints(createdAt: string): number {
  const ageH = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
  if (ageH <= 24) return 15;
  if (ageH <= 72) return 10;
  if (ageH <= 168) return 5;
  return 0;
}

interface ProfileRow {
  id: string;
  industry_interests: string[] | null;
  career_level: string | null;
  role_preferences: string[] | null;
}

interface JobRow {
  id: string;
  industry: string | null;
  career_level: string | null;
  title: string | null;
  salary: string | null;
  created_at: string;
}

async function scoreForUser(
  supabase: ReturnType<typeof createClient>,
  profile: ProfileRow,
) {
  const interests = profile.industry_interests ?? [];
  if (interests.length === 0) return;

  const industrySlugs = [
    ...new Set(interests.flatMap(interestToSlugs)),
  ].filter(Boolean);
  if (industrySlugs.length === 0) return;

  const now = new Date().toISOString();
  const userLevel = (profile.career_level ?? "").toLowerCase();
  const rolePrefs = (profile.role_preferences ?? []).map((r) =>
    r.toLowerCase().trim(),
  );

  // Fetch the most recent 600 live jobs for this user's industries.
  // We score all of them and keep the top 200 in job_matches.
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, industry, career_level, title, salary, created_at")
    .in("industry", industrySlugs)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(600);

  if (error || !jobs?.length) return;

  const scored = (jobs as JobRow[]).map((job) => {
    let score = 0;

    // Industry match — already filtered at DB level, always fires
    score += 40;

    // Career level match
    if (
      userLevel &&
      job.career_level &&
      job.career_level.toLowerCase() === userLevel
    ) {
      score += 20;
    }

    // Role keyword appears in title
    if (rolePrefs.length > 0 && job.title) {
      const titleLower = job.title.toLowerCase();
      if (rolePrefs.some((r) => r && titleLower.includes(r))) score += 20;
    }

    // Has salary (quality signal — 75% of live jobs have it)
    if (job.salary) score += 5;

    // Freshness
    score += freshnessPoints(job.created_at);

    return { job_id: job.id, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 200);
  if (top.length === 0) return;

  const rows = top.map((s) => ({
    user_id: profile.id,
    job_id: s.job_id,
    score: s.score,
    computed_at: now,
  }));

  // Upsert — score + computed_at update on re-run
  await supabase
    .from("job_matches")
    .upsert(rows, { onConflict: "user_id,job_id" });
}

Deno.serve(async (_req) => {
  const work = (async () => {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Get all profiles that have industry interests
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, industry_interests, career_level, role_preferences")
      .not("industry_interests", "is", null);

    if (pErr) {
      console.error("Failed to fetch profiles:", pErr.message);
      return;
    }

    const active = (profiles ?? []).filter(
      (p: ProfileRow) => (p.industry_interests ?? []).length > 0,
    );

    console.log(`Scoring jobs for ${active.length} users`);

    for (const profile of active) {
      try {
        await scoreForUser(supabase, profile as ProfileRow);
      } catch (e) {
        console.error(`Failed to score for user ${profile.id}:`, e);
      }
    }

    // Prune entries older than 14 days — keeps the table lean
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const { error: pruneErr } = await supabase
      .from("job_matches")
      .delete()
      .lt("computed_at", cutoff.toISOString());

    if (pruneErr) {
      console.error("Prune failed:", pruneErr.message);
    }

    console.log(`score-new-jobs complete for ${active.length} users`);
  })();

  if (
    typeof EdgeRuntime !== "undefined" &&
    (EdgeRuntime as unknown as { waitUntil?: (p: Promise<unknown>) => void })
      ?.waitUntil
  ) {
    (EdgeRuntime as unknown as { waitUntil: (p: Promise<unknown>) => void })
      .waitUntil(work);
  } else {
    await work;
  }

  return new Response(JSON.stringify({ accepted: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
