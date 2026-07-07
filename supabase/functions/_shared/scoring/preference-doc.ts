// Builds the user "preference document" — a plain-text portrait of what the
// user wants, embedded with the same model as job embeddings so cosine
// similarity between the two is meaningful.
//
// Sources, in rough order of signal strength:
//   • explicit role preferences + target roles/companies
//   • industry interests + passions (incl. free-text)
//   • CV-derived roles / industries / transferable skills (Understand Me)
//   • titles of recently liked and saved jobs (behavioural ground truth)
//
// Kept isomorphic: pure function of profile + recent likes, no Deno/React.

import type { UserProfile } from "./score-job.ts";
import { getUnderstandMeIndustries, getUnderstandMeRoles } from "./understand-me.ts";

export interface RecentPositive {
  title: string;
  company?: string | null;
}

export function buildPreferenceDoc(
  profile: UserProfile,
  recentPositives: RecentPositive[] = [],
): string {
  const parts: string[] = [];

  const roles = profile.role_preferences ?? [];
  if (roles.length) parts.push(`Wants to work in: ${roles.join(", ")}`);

  const targetRoles = profile.job_preferences?.targetRoles ?? [];
  if (targetRoles.length) parts.push(`Target job titles: ${targetRoles.join(", ")}`);

  const targetCompanies = profile.job_preferences?.targetCompanies ?? [];
  if (targetCompanies.length) parts.push(`Dream companies: ${targetCompanies.join(", ")}`);

  const industries = profile.industry_interests ?? [];
  if (industries.length) parts.push(`Industries they love: ${industries.join(", ")}`);

  const passions = profile.job_preferences?.passions ?? [];
  const passionsText = profile.job_preferences?.passionsText ?? "";
  if (passions.length || passionsText) {
    parts.push(`Passions: ${[...passions, passionsText].filter(Boolean).join(", ")}`);
  }

  if (profile.career_level) parts.push(`Career level: ${profile.career_level}`);
  if (profile.location_preference) parts.push(`Location: ${profile.location_preference}`);

  const umRoles = getUnderstandMeRoles(profile.understand_me_results);
  if (umRoles.length) parts.push(`Suited to roles like: ${umRoles.slice(0, 8).join(", ")}`);

  const umIndustries = getUnderstandMeIndustries(profile.understand_me_results);
  if (umIndustries.length) parts.push(`Background fits: ${umIndustries.slice(0, 8).join(", ")}`);

  const skills = profile.understand_me_results?.transferableSkills ?? [];
  if (skills.length) parts.push(`Transferable skills: ${skills.slice(0, 12).join(", ")}`);

  if (recentPositives.length) {
    const titles = recentPositives
      .slice(0, 20)
      .map((p) => (p.company ? `${p.title} at ${p.company}` : p.title));
    parts.push(`Recently liked jobs: ${titles.join("; ")}`);
  }

  return parts.join("\n");
}
