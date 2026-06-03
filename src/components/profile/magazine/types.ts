import type { LovePhoto } from "@/components/profile/LovesGallery";
import type { FamilyPhoto } from "@/components/profile/FamilyPetsGallery";
import type { RiasecScores, WorkValues } from "@/components/RiasecQuiz";

export interface PrintableData {
  fullName: string;
  pronouns?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  homeTown?: string;
  homeTownBlurb?: string;
  locationPreference?: string;
  careerLevel?: string;
  salaryExpectation?: string;
  photoUrl?: string | null;
  pbIntro?: string;
  pbLookingFor?: string;
  pbPersonalLink?: string;
  pbInstagram?: string;
  pbTiktok?: string;
  pbPortfolio?: string;
  pbPromptAnswers?: Record<string, string>;
  passions?: string[];
  industryInterests?: string[];
  rolePreferences?: string[];
  transferableSkills?: string[];
  targetCompanies?: string[];
  targetRoles?: string[];
  funFacts?: { q: string; a: string }[];
  lovePhotos?: LovePhoto[];
  familyPhotos?: FamilyPhoto[];
  riasecScores?: RiasecScores | null;
  workValues?: WorkValues | null;
  personalitySummary?: string;
  workHistory?: { id?: string; title: string; company?: string; when?: string; description?: string; logoUrl?: string; link?: string }[];
  education?: { id?: string; school: string; qualification?: string; dates?: string; grade?: string; logoUrl?: string; link?: string }[];
  qualifications?: { id?: string; name: string; issuer?: string; year?: string }[];
}

export type TemplateKey =
  | "balanced-executive"
  | "profile-heavy"
  | "career-heavy"
  | "image-heavy"
  | "text-heavy";

export interface ContentInventory {
  hasPhoto: boolean;
  hasIntro: boolean;
  introWords: number;
  introText: string;
  lovesCount: number;
  passionsCount: number;
  industriesCount: number;
  workCount: number;
  careerWords: number;
  eduCount: number;
  qualsCount: number;
  funFactCount: number;
  hasRiasec: boolean;
  hasValues: boolean;
  targetRolesCount: number;
  targetCompaniesCount: number;
}

export interface Scores {
  fillP1: number;
  fillP2: number;
  fill: number;     // average
  balance: number;  // 1 - |fillP1 - fillP2|
  inclusion: number;
  readability: number; // 0 or 1
  printSafe: number;   // 0 or 1
}

export const PASS = {
  fillMin: 0.9,
  fillMax: 0.98,
  balance: 0.85,
  inclusion: 0.7,
};

export interface RenderTuning {
  // shrink/grow descriptions, chip caps etc.
  workSummaryRatio: number; // 1.0 = original, 0.55 = shorter
  passionsCap: number;
  industriesCap: number;
  lovesCap: number;
  funFactsCap: number;
  workDescCap: number; // chars
  showPullQuote: boolean;
  density: "loose" | "normal" | "tight";
  // filler toggles
  fillerSkills: boolean;
  fillerPromptAnswers: boolean;
}

export const defaultTuning: RenderTuning = {
  workSummaryRatio: 1,
  passionsCap: 18,
  industriesCap: 14,
  lovesCap: 6,
  funFactsCap: 4,
  workDescCap: 360,
  showPullQuote: true,
  density: "normal",
  fillerSkills: false,
  fillerPromptAnswers: false,
};
