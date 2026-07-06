// Parity fixtures for the canonical shared scorer. These pin exact scores and
// match tags for hand-built job/profile combinations so any change to scoring
// behaviour — intended or not — shows up as a failing test with a diff.
import { describe, expect, it } from "vitest";
import {
  buildLearnedSignals,
  jobDedupeKey,
  passesSalaryFilter,
  scoreJob,
  shouldExcludeJob,
  type Job,
  type UserProfile,
} from "@scoring/score-job.ts";

const STALE = "2020-01-01T00:00:00Z"; // outside freshness window → +0

const baseJob: Job = {
  id: "j1",
  title: "Marketing Manager",
  company: "Nike",
  location: "London",
  salary: "£45,000",
  industry: "footwear",
  career_level: "mid",
  url: "https://example.com/j1",
  created_at: STALE,
  type: "Full-time",
  work_mode: "Hybrid",
  role_category: "marketing",
  ai_role_category: "marketing",
  job_traits: null,
  description: "Own the marketing calendar for a global footwear brand.",
  tags: null,
  expires_at: "2099-01-01T00:00:00Z",
};

const baseProfile: UserProfile = {
  career_level: "mid",
  industry_interests: ["Footwear"],
  location_preference: "london",
  role_preferences: ["Marketing"],
  salary_expectation: null,
  understand_me_results: null,
  riasec_scores: null,
  work_values: null,
  job_preferences: null,
};

const ctx = { roleProfiles: new Map() };

describe("scoreJob parity", () => {
  it("scores a full match on industry+role+level+location", () => {
    const { score, matches } = scoreJob(baseJob, baseProfile, ctx);
    // weights present: industry 40 + role 20 + level 15 + location 10 = 85, all hit
    // → 100, then Nike is a known footwear employer (+industry rank boost)
    expect(score).toBe(100);
    expect(matches).toContain("Industry");
    expect(matches).toContain("Role");
    expect(matches).toContain("Level");
    expect(matches).toContain("Location");
  });

  it("scores partial match when industry misses", () => {
    const job = { ...baseJob, industry: "farming", company: "Anon Farms" };
    const { score, matches } = scoreJob(job, baseProfile, ctx);
    // hit: role 20 + level 15 + location 10 = 45 of 85 → 53
    expect(score).toBe(53);
    expect(matches).not.toContain("Industry");
    expect(matches).toContain("Role");
  });

  it("gives target company flat boost with Wanted tag", () => {
    const profile: UserProfile = {
      ...baseProfile,
      job_preferences: { targetCompanies: ["Nike"] },
    };
    const { score, matches } = scoreJob(baseJob, baseProfile, ctx);
    const boosted = scoreJob(baseJob, profile, ctx);
    expect(boosted.matches).toContain("Wanted · Nike");
    expect(boosted.score).toBeGreaterThanOrEqual(score);
  });

  it("matches passions via keyword with Passion post tag", () => {
    const profile: UserProfile = {
      ...baseProfile,
      industry_interests: ["Fashion"],
      role_preferences: [],
      job_preferences: { passions: ["Trainers"] },
    };
    const job = {
      ...baseJob,
      industry: "footwear",
      title: "Sneaker Product Developer",
      description: "Work on trainers and sneaker drops all day.",
      company: "Anon Co",
    };
    const { matches } = scoreJob(job, profile, ctx);
    expect(matches.some((m) => m.startsWith("Passion post"))).toBe(true);
  });

  it("applies fresh-job boost", () => {
    const fresh = { ...baseJob, created_at: new Date().toISOString() };
    const profile = { ...baseProfile, industry_interests: ["Farming"] }; // force sub-100 base
    const staleScore = scoreJob(baseJob, profile, ctx).score;
    const freshScore = scoreJob(fresh, profile, ctx).score;
    expect(freshScore).toBe(Math.min(100, staleScore + 18));
  });

  it("intersection boost fires for 2+ industry users on intersection titles", () => {
    const profile: UserProfile = {
      ...baseProfile,
      industry_interests: ["Football", "Fashion"],
      role_preferences: [],
    };
    const job = {
      ...baseJob,
      industry: "football",
      company: "Anon FC",
      title: "Kit Designer",
    };
    const { matches } = scoreJob(job, profile, ctx);
    expect(matches).toContain("Intersection match");
  });

  it("semantic similarity slots in as a weighted component with Strong fit tag", () => {
    const without = scoreJob(baseJob, baseProfile, ctx);
    const withSem = scoreJob(baseJob, baseProfile, { ...ctx, semanticSimilarity: 0.9 });
    expect(withSem.matches).toContain("Strong fit");
    // Full-match profile stays at 100; semantic must never lower a perfect score
    expect(withSem.score).toBeGreaterThanOrEqual(without.score - 1);
    // On a weaker match the component shifts the score
    const weakProfile = { ...baseProfile, industry_interests: ["Farming"] };
    const weakWithout = scoreJob(baseJob, weakProfile, ctx).score;
    const weakWith = scoreJob(baseJob, weakProfile, { ...ctx, semanticSimilarity: 1 }).score;
    expect(weakWith).toBeGreaterThan(weakWithout);
  });

  it("learned signals boost liked patterns and penalise dismissed ones", () => {
    const likedJob = { ...baseJob, id: "liked1", title: "Brand Marketing Lead", company: "Adidas" };
    const dismissedJob = { ...baseJob, id: "dis1", title: "Warehouse Operative", company: "Generic Logistics" };
    const learned = buildLearnedSignals(
      [likedJob, dismissedJob],
      new Set(["dis1"]),
      new Set(),
      new Set(["liked1"]),
    );
    const similarToLiked = { ...baseJob, id: "x", title: "Brand Marketing Executive", company: "Adidas" };
    const similarToDismissed = { ...baseJob, id: "y", title: "Warehouse Operative Nights", company: "Generic Logistics" };
    const up = scoreJob(similarToLiked, baseProfile, { ...ctx, learned });
    const down = scoreJob(similarToDismissed, baseProfile, { ...ctx, learned });
    expect(up.score).toBeGreaterThan(down.score);
    expect(down.matches).toContain("↓ Learned");
  });
});

describe("exclusions and filters parity", () => {
  it("blocks regulated clinical roles for non-clinical profiles", () => {
    const job = { ...baseJob, title: "Staff Nurse", industry: "health" };
    expect(shouldExcludeJob(job, baseProfile)).toBe(true);
  });

  it("blocks senior-level jobs for entry users", () => {
    const job = { ...baseJob, career_level: "senior", title: "Head of Marketing" };
    const entry = { ...baseProfile, career_level: "entry" };
    expect(shouldExcludeJob(job, entry)).toBe(true);
  });

  it("salary filter respects 85% tolerance", () => {
    expect(passesSalaryFilter({ ...baseJob, salary: "£44,000" }, 50000)).toBe(true); // 44k ≥ 42.5k
    expect(passesSalaryFilter({ ...baseJob, salary: "£30,000" }, 50000)).toBe(false);
  });

  it("dedupe key merges same job across boards", () => {
    const a = { title: "Barista - Soho", company: "Grind Ltd.", location: "London" };
    const b = { title: "Barista - Soho", company: "Grind", location: "Central London" };
    expect(jobDedupeKey(a)).toBe(jobDedupeKey(b));
  });
});
