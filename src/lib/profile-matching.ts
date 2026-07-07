/**
 * Shared profile matching utilities used by both MatchMe and MyJobs.
 * Ensures both pages use identical logic for determining what drives the algorithm.
 */

import { getUnderstandMeIndustries, getUnderstandMeRoles, type UnderstandMeResults } from "@scoring/understand-me.ts";

export type IndustrySource = "you set this" | "your CV";
export type RoleSource = "dream role" | "your CV";

export interface TaggedIndustry {
  name: string;
  source: IndustrySource;
  confidence?: number;
}

export interface TaggedRole {
  name: string;
  source: RoleSource;
  percentage?: number;
}

/**
 * Returns the industries that drive the algorithm, with a source badge.
 * Mirrors the priority logic in MyJobs getEffectiveIndustries():
 *   1. Explicit industry_interests (wins if set)
 *   2. Strong understand-me industries (confidence >= 75%)
 *   3. Any understand-me industries (fallback)
 */
export function getEffectiveIndustriesTagged(
  industryInterests: string[],
  understandMeResults: UnderstandMeResults | null | undefined,
): TaggedIndustry[] {
  if (industryInterests.length > 0) {
    return industryInterests.map((name) => ({ name, source: "you set this" as IndustrySource }));
  }
  const fromCv = (understandMeResults?.industryFit ?? [])
    .filter((ind) => ind.industry)
    .map((ind) => ({ name: ind.industry!, source: "your CV" as IndustrySource, confidence: ind.confidence }));
  return fromCv;
}

/**
 * Returns ONLY the CV-inferred industries (even when explicit interests are set).
 * Used to surface "we also spotted these from your CV" hints.
 */
export function getCvIndustriesTagged(
  understandMeResults: UnderstandMeResults | null | undefined,
): TaggedIndustry[] {
  return (understandMeResults?.industryFit ?? [])
    .filter((ind) => ind.industry)
    .map((ind) => ({ name: ind.industry!, source: "your CV" as IndustrySource, confidence: ind.confidence }));
}

/**
 * Returns the roles that drive the algorithm, with a source badge.
 * Mirrors the priority logic in MyJobs getEffectiveRoles():
 *   1. Explicit role_preferences (wins if set)
 *   2. Strong understand-me roles (percentage >= 80%)
 *   3. Any understand-me roles (fallback)
 */
export function getEffectiveRolesTagged(
  rolePreferences: string[],
  understandMeResults: UnderstandMeResults | null | undefined,
): TaggedRole[] {
  if (rolePreferences.length > 0) {
    return rolePreferences.map((name) => ({ name, source: "dream role" as RoleSource }));
  }
  return (understandMeResults?.roleMatches ?? [])
    .filter((r) => r.role)
    .map((r) => ({ name: r.role!, source: "your CV" as RoleSource, percentage: r.percentage }));
}

/**
 * Flat list of effective industry names (no source annotation).
 * Convenience wrapper for use in scoring/filtering.
 */
export function getEffectiveIndustryNames(
  industryInterests: string[],
  understandMeResults: UnderstandMeResults | null | undefined,
): string[] {
  return getEffectiveIndustriesTagged(industryInterests, understandMeResults).map((t) => t.name);
}

/**
 * Converts the scoreJob matches[] array into human-readable reason strings.
 * Used in HowdyJobs job cards to explain why a job was surfaced.
 */
export function matchesToReasons(matches: string[], jobIndustry?: string | null): string[] {
  return matches
    .filter((m) => !m.startsWith("✓")) // strip internal signals
    .slice(0, 3)
    .map((m) => {
      if (m === "Industry") return jobIndustry ? `${jobIndustry} — your industry` : "Industry match";
      if (m === "Role") return "Fits your target role";
      if (m === "Level") return "Right career level";
      if (m === "Location") return "In your preferred location";
      if (m === "Personality") return "Suits your personality type";
      if (m === "Skills") return "Your skills align";
      if (m === "Values") return "Matches your work values";
      if (m === "Intersection match") return "Cross-industry sweet spot";
      if (m.startsWith("Passion post · ")) return `Connects to ${m.replace("Passion post · ", "")}`;
      if (m.startsWith("Wanted · ")) return `Your target: ${m.replace("Wanted · ", "")}`;
      return m;
    });
}
