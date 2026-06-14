import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Briefcase, Building2, Zap, Rocket, User, Heart, Target, Brain, Shuffle, MapPin, Layers, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getMatchingIntersections, type SkillCategory, type IntersectionRole } from "@/data/intersection-roles";
import { getEffectiveIndustriesTagged, getEffectiveRolesTagged, getCvIndustriesTagged, type TaggedIndustry, type TaggedRole } from "@/lib/profile-matching";
import { RoleMixer } from "@/components/RoleMixer";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg-industries.jpg";
import howdyMascot from "@/assets/howdy-mascot.png";
import doodleDivider from "@/assets/email-doodle-divider.png";

import iconBakery from "@/assets/email-icon-bakery.png";
import iconBeauty from "@/assets/email-icon-beauty.png";
import iconBeer from "@/assets/email-icon-beer.png";
import iconCars from "@/assets/email-icon-cars.png";
import iconCharity from "@/assets/email-icon-charity.png";
import iconCinema from "@/assets/email-icon-cinema.png";
import iconCoffee from "@/assets/email-icon-coffee.png";
import iconEstateAgency from "@/assets/email-icon-estate-agency.png";
import iconFashion from "@/assets/email-icon-fashion.png";
import iconFootball from "@/assets/email-icon-football.png";
import iconFootwear from "@/assets/email-icon-footwear.png";
import iconGaming from "@/assets/email-icon-gaming.png";
import iconGrocery from "@/assets/email-icon-grocery.png";
import iconHospitality from "@/assets/email-icon-hospitality.png";
import iconInteriorDesign from "@/assets/email-icon-interior-design.png";
import iconJewellery from "@/assets/email-icon-jewellery.png";
import iconJournalism from "@/assets/email-icon-journalism.png";
import iconMusic from "@/assets/email-icon-music.png";
import iconPets from "@/assets/email-icon-pets.png";
import iconPhysiotherapy from "@/assets/email-icon-physiotherapy.png";
import iconPsychotherapy from "@/assets/email-icon-psychotherapy.png";
import iconTeaching from "@/assets/email-icon-teaching.png";
import iconTravel from "@/assets/email-icon-travel.png";
import iconWellness from "@/assets/email-icon-wellness.png";

const INDUSTRY_ICONS: Record<string, string> = {
  "Bakery": iconBakery, "Beauty": iconBeauty, "Beer & Drinks": iconBeer, "Cars": iconCars,
  "Charity": iconCharity, "Cinema & Film": iconCinema, "Coffee": iconCoffee,
  "Estate Agency": iconEstateAgency, "Fashion": iconFashion, "Football": iconFootball,
  "Footwear": iconFootwear, "Gaming": iconGaming, "Grocery": iconGrocery,
  "Hospitality": iconHospitality, "Interior Design": iconInteriorDesign,
  "Jewellery": iconJewellery, "Journalism": iconJournalism, "Music": iconMusic,
  "Pets": iconPets, "Physiotherapy": iconPhysiotherapy, "Psychotherapy": iconPsychotherapy,
  "Teaching": iconTeaching, "Travel": iconTravel, "Wellness": iconWellness,
};

interface RoleMatch { role: string; slug: string; percentage: number; reason: string; }
interface IndustryFit { industry: string; confidence: number; reason: string; }
interface UnderstandMeResult {
  roleMatches?: RoleMatch[];
  industryFit?: IndustryFit[];
  transferableSkills?: string[];
  personalityInsights?: string;
}

const INDUSTRY_SLUGS: Record<string, string> = {
  "Beauty": "beauty", "Beer & Drinks": "beer", "Cars": "cars", "Cinema & Film": "cinema",
  "Coffee": "coffee", "Fashion": "fashion", "Football": "football", "Gaming": "gaming",
  "Grocery": "grocery", "Health": "health", "Hospitality": "hospitality",
  "Influencing": "influencing", "Interior Design": "interior-design", "Jewellery": "jewellery",
  "Journalism": "journalism", "Money": "money", "Music": "music", "Pets": "pets",
  "Physiotherapy": "physiotherapy", "Psychotherapy": "psychotherapy", "Teaching": "teaching",
  "Travel": "travel", "Wellness": "wellness", "Formula 1": "formula-1", "Farming": "farming",
  "Charity": "charity", "Estate Agency": "estate-agency", "Horse Racing": "horse-racing",
  "Bakery": "bakery", "Footwear": "footwear",
};

const SIDE_HUSTLE_IDEAS: { title: string; desc: string; link: string; tags: SkillCategory[] }[] = [
  { title: "Freelance Design", desc: "Logos, social graphics, presentations. Start on Fiverr or direct to small businesses.", link: "/side-hustles", tags: ["creative"] },
  { title: "Content Creation", desc: "Build an audience around something you know. Monetise through brand deals or courses.", link: "/side-hustles", tags: ["creative", "digital"] },
  { title: "Tutoring & Teaching", desc: "Share what you know. Tutor students, teach skills online, or run workshops.", link: "/side-hustles", tags: ["people"] },
  { title: "Social Media Management", desc: "Help local businesses grow their online presence — a learnable, in-demand skill.", link: "/side-hustles", tags: ["digital", "creative"] },
  { title: "Photography & Video", desc: "Events, portraits, product shots. Equipment costs are falling. Talent travels.", link: "/side-hustles", tags: ["creative", "practical"] },
  { title: "Copywriting & Content", desc: "Write for brands, blogs and websites. One of the most flexible digital skills.", link: "/side-hustles", tags: ["creative", "digital"] },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const RIASEC_LABELS: Record<string, { label: string; emoji: string }> = {
  R: { label: "Realistic", emoji: "🔧" },
  I: { label: "Investigative", emoji: "🔬" },
  A: { label: "Artistic", emoji: "🎨" },
  S: { label: "Social", emoji: "🤝" },
  E: { label: "Enterprising", emoji: "🚀" },
  C: { label: "Conventional", emoji: "📋" },
};

const SKILL_LABELS: Record<SkillCategory, { label: string; emoji: string }> = {
  creative: { label: "Creative", emoji: "🎨" },
  people: { label: "People", emoji: "🤝" },
  digital: { label: "Digital", emoji: "💻" },
  practical: { label: "Practical", emoji: "🔧" },
};

interface ProfileContext {
  riasecScores: Record<string, number> | null;
  passions: string[];
  industryInterests: string[];
  rolePreferences: string[];
  targetCompanies: string[];
  selfDeclaredSkills: string[];
  careerLevel: string | null;
  location: string | null;
  skillCategories: SkillCategory[];
  hasQuiz: boolean;
  effectiveIndustries: TaggedIndustry[];
  effectiveRoles: TaggedRole[];
  cvIndustries: TaggedIndustry[];
}

function Chip({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "cv" | "desired" | "passion" | "skill" }) {
  const styles: Record<string, string> = {
    default: "bg-background border border-foreground/20 text-foreground",
    cv: "bg-blue-50 border border-blue-200 text-blue-700",
    desired: "bg-primary/10 border border-primary/30 text-primary",
    passion: "bg-amber-50 border border-amber-200 text-amber-800",
    skill: "bg-purple-50 border border-purple-200 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-display font-700 text-xs ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default function MatchMe() {
  const { user } = useAuth();
  const [results, setResults] = useState<UnderstandMeResult | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileContext>({
    riasecScores: null, passions: [], industryInterests: [],
    rolePreferences: [], targetCompanies: [], selfDeclaredSkills: [],
    careerLevel: null, location: null, skillCategories: [], hasQuiz: false,
    effectiveIndustries: [], effectiveRoles: [], cvIndustries: [],
  });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("understand_me_results, full_name, riasec_scores, industry_interests, role_preferences, job_preferences")
        .eq("id", user.id)
        .maybeSingle();

      setResults((data as any)?.understand_me_results || null);
      const name = (data as any)?.full_name as string | null;
      setFirstName(name ? name.trim().split(/\s+/)[0] : null);

      const jp = (data as any)?.job_preferences || {};
      const pb = jp.profileBuilder || {};

      const passionArr: string[] = [
        ...(Array.isArray(jp.passions) ? jp.passions : []),
        ...(typeof jp.passionsText === "string" ? jp.passionsText.split(/[,\n]+/).map((s: string) => s.trim()).filter(Boolean) : []),
        ...(Array.isArray(pb.passions) ? pb.passions : []),
      ];
      const uniquePassions = Array.from(new Set(passionArr)).slice(0, 10);
      const targetCompanies: string[] = Array.isArray(pb.targetCompanies) ? pb.targetCompanies.slice(0, 6) : [];
      const careerLevel: string | null = pb.careerLevel || jp.careerLevel || null;
      const location: string | null = pb.location || jp.location || jp.preferredLocation || null;

      // Flatten self-declared skills from onboarding categories
      const skillsObj: any = pb.skills || {};
      const selfDeclaredSkills: string[] = [
        ...(Array.isArray(skillsObj.creative) ? skillsObj.creative : []),
        ...(Array.isArray(skillsObj.people) ? skillsObj.people : []),
        ...(Array.isArray(skillsObj.digital) ? skillsObj.digital : []),
        ...(Array.isArray(skillsObj.practical) ? skillsObj.practical : []),
      ].slice(0, 12);

      const riasec = (data as any)?.riasec_scores as Record<string, number> | null;
      const industryInterests: string[] = data?.industry_interests || [];
      const rolePrefs: string[] = data?.role_preferences || [];

      // Derive skill categories from role preferences
      const rolePrefLower = rolePrefs.map((r) => r.toLowerCase());
      const skillCategories: SkillCategory[] = [];
      if (rolePrefLower.some((r) => ["creative", "marketing", "content", "brand", "design", "media", "influenc"].some((k) => r.includes(k)))) skillCategories.push("creative");
      if (rolePrefLower.some((r) => ["people", "hr", "culture", "talent", "coaching", "community", "partnerships", "sales", "commercial"].some((k) => r.includes(k)))) skillCategories.push("people");
      if (rolePrefLower.some((r) => ["strategy", "product", "data", "digital", "tech", "e-commerce", "analytics", "operations", "project"].some((k) => r.includes(k)))) skillCategories.push("digital");
      if (rolePrefLower.some((r) => ["operations", "production", "logistics", "project", "event", "facilities", "practical"].some((k) => r.includes(k)))) skillCategories.push("practical");
      if (skillCategories.length === 0) {
        if (Array.isArray(skillsObj.creative) && skillsObj.creative.length > 0) skillCategories.push("creative");
        if (Array.isArray(skillsObj.people) && skillsObj.people.length > 0) skillCategories.push("people");
        if (Array.isArray(skillsObj.digital) && skillsObj.digital.length > 0) skillCategories.push("digital");
        if (Array.isArray(skillsObj.practical) && skillsObj.practical.length > 0) skillCategories.push("practical");
      }

      const understandMeResults = (data as any)?.understand_me_results || null;
      const effectiveIndustries = getEffectiveIndustriesTagged(industryInterests, understandMeResults);
      const effectiveRoles = getEffectiveRolesTagged(rolePrefs, understandMeResults);
      const cvIndustries = getCvIndustriesTagged(understandMeResults);

      setProfile({
        riasecScores: riasec, passions: uniquePassions, industryInterests,
        rolePreferences: rolePrefs, targetCompanies, selfDeclaredSkills,
        careerLevel, location, skillCategories, hasQuiz: !!riasec,
        effectiveIndustries, effectiveRoles, cvIndustries,
      });
      setLoading(false);
    })();
  }, [user]);

  const hasResults = results && (
    (results.roleMatches && results.roleMatches.length > 0) ||
    (results.industryFit && results.industryFit.length > 0)
  );

  const sidehustles = [...SIDE_HUSTLE_IDEAS]
    .map((s) => ({ ...s, score: s.tags.filter((t) => profile.skillCategories.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Worlds Collide: STATIC ONLY (no AI intersections — they can hallucinate irrelevant industries)
  const effectiveIndustryNames = profile.effectiveIndustries.map((i) => i.name);
  const industrySlugSet = new Set(effectiveIndustryNames.map((i) => INDUSTRY_SLUGS[i] || i.toLowerCase()));
  const staticIntersections: IntersectionRole[] = getMatchingIntersections(
    Array.from(industrySlugSet),
    profile.skillCategories,
    profile.rolePreferences,
  );

  // Top RIASEC traits (sorted descending)
  const topRiasec = profile.riasecScores
    ? (Object.entries(profile.riasecScores) as [string, number][]).sort((a, b) => b[1] - a[1])
    : [];

  // Signal completeness — what's missing
  const hasDesiredIndustries = profile.industryInterests.length > 0;
  const hasDesiredRoles = profile.rolePreferences.length > 0;
  const hasPassions = profile.passions.length > 0;
  const hasCvData = hasResults;
  const hasRiasec = profile.hasQuiz;

  return (
    <>
      <SEO title="Match Me | Howdoyoudo?" description="Discover the roles, industries and opportunities that match who you are." />
      <main className="min-h-screen bg-background">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <img src={heroBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none select-none" />
          <div className="relative px-4 sm:px-6 lg:px-10 pt-10 pb-14 max-w-5xl mx-auto text-center">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="font-display font-700 text-xs uppercase tracking-widest">Your matches</span>
              </div>
              <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground">
                {firstName ? `Here's your picture,\n${firstName}.` : "Here's your\nbig picture."}
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                Everything we know about you, how we use it, and where it could take you.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto py-10 space-y-14">

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && !user && (
            <motion.div {...fadeUp} className="text-center py-16 border-2 border-dashed border-foreground/20 rounded-3xl">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display font-900 text-2xl mb-2">Sign in to see your matches</h2>
              <p className="font-body text-muted-foreground mb-6">Create your profile and we'll match you to roles, industries and opportunities.</p>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/auth">Sign in / Create account <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </motion.div>
          )}

          {!loading && user && (
            <div className="space-y-14">

              {/* ── 1. SIGNAL DASHBOARD ── */}
              <motion.section {...fadeUp}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-900 text-xl uppercase tracking-wide">What Howdy knows about you</h2>
                    <p className="font-body text-xs text-muted-foreground">All the signals we use to rank your matches</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* From your CV */}
                  <div className="border-2 border-blue-200 rounded-2xl p-4 bg-blue-50/40 space-y-4">
                    <p className="font-display font-700 text-[10px] uppercase tracking-widest text-blue-600">From your CV (Understand Me)</p>

                    {hasCvData ? (
                      <>
                        {results!.industryFit && results!.industryFit.length > 0 && (
                          <div>
                            <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> Experience industries
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {results!.industryFit.slice(0, 5).map((ind) => (
                                <Chip key={ind.industry} variant="cv">{ind.industry} <span className="ml-1 opacity-60">{ind.confidence}%</span></Chip>
                              ))}
                            </div>
                          </div>
                        )}
                        {results!.roleMatches && results!.roleMatches.length > 0 && (
                          <div>
                            <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> Experience roles
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {results!.roleMatches.slice(0, 4).map((r) => (
                                <Chip key={r.slug} variant="cv">{r.role}</Chip>
                              ))}
                            </div>
                          </div>
                        )}
                        {results!.transferableSkills && results!.transferableSkills.length > 0 && (
                          <div>
                            <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Transferable skills
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {results!.transferableSkills.slice(0, 6).map((sk) => (
                                <Chip key={sk} variant="cv">{sk}</Chip>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="font-body text-xs text-muted-foreground mb-3">Upload your CV and we'll analyse your background</p>
                        <Link to="/my-profile" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-600 text-white font-display font-700 text-xs">
                          Run Understand Me <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* You told us */}
                  <div className="border-2 border-primary/20 rounded-2xl p-4 bg-primary/5 space-y-4">
                    <p className="font-display font-700 text-[10px] uppercase tracking-widest text-primary">You told us</p>

                    {hasDesiredIndustries ? (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Desired industries
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.industryInterests.map((ind) => (
                            <Chip key={ind} variant="desired">{ind}</Chip>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Desired industries</p>
                        <Link to="/onboarding?step=interests" className="font-body text-xs text-primary underline">Add industries →</Link>
                      </div>
                    )}

                    {hasDesiredRoles ? (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Desired roles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.rolePreferences.map((r) => (
                            <Chip key={r} variant="desired">{r}</Chip>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Desired roles</p>
                        <Link to="/onboarding?step=roles" className="font-body text-xs text-primary underline">Add dream roles →</Link>
                      </div>
                    )}

                    {hasPassions && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Passions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.passions.slice(0, 6).map((p) => (
                            <Chip key={p} variant="passion">{p}</Chip>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.targetCompanies.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Dream companies
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.targetCompanies.map((c) => (
                            <Chip key={c} variant="desired">{c}</Chip>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.selfDeclaredSkills.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Self-declared skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.selfDeclaredSkills.slice(0, 6).map((sk) => (
                            <Chip key={sk} variant="skill">{sk}</Chip>
                          ))}
                        </div>
                      </div>
                    )}

                    {(profile.careerLevel || profile.location) && (
                      <div className="flex flex-wrap gap-2">
                        {profile.careerLevel && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-foreground/20 font-display font-700 text-xs">
                            <Briefcase className="w-3 h-3 text-muted-foreground" /> {profile.careerLevel}
                          </span>
                        )}
                        {profile.location && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-foreground/20 font-display font-700 text-xs">
                            <MapPin className="w-3 h-3 text-muted-foreground" /> {profile.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Personality */}
                  <div className="border-2 border-purple-200 rounded-2xl p-4 bg-purple-50/40 space-y-4">
                    <p className="font-display font-700 text-[10px] uppercase tracking-widest text-purple-600">Your personality</p>

                    {hasRiasec ? (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> RIASEC profile
                        </p>
                        <div className="space-y-2">
                          {topRiasec.map(([k, v]) => (
                            <div key={k}>
                              <div className="flex justify-between mb-0.5">
                                <span className="font-display font-700 text-xs flex items-center gap-1">
                                  {RIASEC_LABELS[k]?.emoji} {RIASEC_LABELS[k]?.label ?? k}
                                </span>
                                <span className="font-display font-700 text-xs text-primary">{Math.round(v)}</span>
                              </div>
                              <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="font-body text-[10px] text-muted-foreground mt-2">Used to boost jobs that match your personality type</p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="font-body text-xs text-muted-foreground mb-3">Take the 12-question quiz to add your personality type</p>
                        <Link to="/onboarding?step=personality" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-purple-600 text-white font-display font-700 text-xs">
                          Take the quiz <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    {profile.skillCategories.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Skill type
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.skillCategories.map((sk) => (
                            <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 border border-purple-200 font-display font-700 text-xs text-purple-700">
                              {SKILL_LABELS[sk].emoji} {SKILL_LABELS[sk].label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* ── 2. HOW THIS LEADS TO HOWDY JOBS ── */}
              <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
                <Link
                  to="/my-jobs?tab=jobs"
                  className="group relative flex flex-col sm:flex-row items-center gap-6 bg-foreground text-background rounded-3xl p-6 md:p-8 overflow-hidden hover:-translate-y-0.5 transition-transform"
                >
                  <img src={howdyMascot} alt="Howdy" className="w-28 h-28 sm:w-32 sm:h-32 object-contain shrink-0 drop-shadow-xl" />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/20 mb-3">
                      <span className="font-display font-700 text-xs uppercase tracking-widest text-primary">Powered by your profile</span>
                    </div>
                    <h2 className="font-display font-900 text-2xl md:text-3xl uppercase tracking-wide text-background mb-3">
                      Howdy Jobs
                    </h2>
                    {/* Algorithm flow */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 justify-center sm:justify-start">
                      {hasDesiredIndustries ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-display font-700 text-[10px] uppercase tracking-wide">
                          ✓ {profile.industryInterests.length} desired {profile.industryInterests.length === 1 ? "industry" : "industries"}
                        </span>
                      ) : hasCvData ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 font-display font-700 text-[10px] uppercase tracking-wide">
                          CV industries (no desired set)
                        </span>
                      ) : null}
                      {(hasDesiredIndustries || hasCvData) && <ChevronRight className="w-3 h-3 text-background/40" />}
                      {hasDesiredRoles ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-display font-700 text-[10px] uppercase tracking-wide">
                          ✓ {profile.rolePreferences.length} desired {profile.rolePreferences.length === 1 ? "role" : "roles"}
                        </span>
                      ) : hasCvData ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 font-display font-700 text-[10px] uppercase tracking-wide">
                          CV roles (no desired set)
                        </span>
                      ) : null}
                      {hasPassions && <><ChevronRight className="w-3 h-3 text-background/40" /><span className="px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 font-display font-700 text-[10px] uppercase tracking-wide">✓ passions</span></>}
                      {hasRiasec && <><ChevronRight className="w-3 h-3 text-background/40" /><span className="px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 font-display font-700 text-[10px] uppercase tracking-wide">✓ RIASEC</span></>}
                    </div>
                    <div className="inline-flex items-center gap-2 font-display font-900 text-sm uppercase tracking-wide text-primary group-hover:gap-3 transition-all">
                      See my Howdy Jobs <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.section>

              {/* ── Doodle divider ── */}
              <div className="flex items-center justify-center py-2">
                <img src={doodleDivider} alt="" aria-hidden className="w-full max-w-md opacity-40 select-none pointer-events-none" />
              </div>

              {/* ── 3. ROLE MATCHES (CV) ── */}
              {results?.roleMatches && results.roleMatches.length > 0 && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Roles you might love</h2>
                      <p className="font-body text-xs text-muted-foreground">Based on your CV and background — roles where your experience fits</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
                    {results.roleMatches.slice(0, 6).map((m) => (
                      <div key={m.slug} className="relative border-2 border-blue-200 bg-blue-50/30 rounded-2xl p-4 flex flex-col gap-3 overflow-hidden">
                        <div className="absolute bottom-0 left-0 h-0.5 bg-blue-400/40 transition-all" style={{ width: `${m.percentage}%` }} />
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-display font-900 text-sm uppercase tracking-wide leading-tight">{m.role}</span>
                            <span className="font-display font-900 text-base text-blue-600 shrink-0">{m.percentage}%</span>
                          </div>
                          <p className="font-body text-xs text-muted-foreground line-clamp-2">{m.reason}</p>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2 border-t border-blue-100">
                          <Link to={`/roles/${m.slug}`} className="font-display font-700 text-xs uppercase tracking-wide text-foreground hover:text-primary transition-colors">
                            Explore →
                          </Link>
                          <span className="text-border select-none">·</span>
                          <Link to={`/marketplace?role=${encodeURIComponent(m.role)}`} className="font-display font-700 text-xs uppercase tracking-wide text-primary hover:opacity-80 transition-opacity">
                            Find jobs →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── 4. INDUSTRY FIT (CV) ── */}
              {results?.industryFit && results.industryFit.length > 0 && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Industries where you'd thrive</h2>
                      <p className="font-body text-xs text-muted-foreground">Sectors your background maps well to, based on your CV</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.industryFit.slice(0, 4).map((ind) => {
                      const slug = INDUSTRY_SLUGS[ind.industry];
                      const icon = INDUSTRY_ICONS[ind.industry];
                      return (
                        <div key={ind.industry} className="relative border-2 border-blue-200 bg-blue-50/30 rounded-2xl p-5 flex flex-col gap-3 overflow-hidden">
                          {icon && <img src={icon} alt="" aria-hidden className="absolute -right-3 -top-3 w-24 h-24 object-contain opacity-10 pointer-events-none select-none rotate-6" />}
                          <div className="relative">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-display font-900 text-base uppercase tracking-wide leading-tight">{ind.industry}</span>
                              <span className="font-display font-900 text-base text-blue-600 shrink-0">{ind.confidence}%</span>
                            </div>
                            <p className="font-body text-xs text-muted-foreground line-clamp-2">{ind.reason}</p>
                          </div>
                          <div className="flex gap-2 mt-auto pt-2 border-t border-blue-100 relative">
                            {slug && <><Link to={`/${slug}`} className="font-display font-700 text-xs uppercase tracking-wide text-foreground hover:text-primary transition-colors">Explore →</Link><span className="text-border select-none">·</span></>}
                            <Link to={`/marketplace?industry=${encodeURIComponent(ind.industry)}`} className="font-display font-700 text-xs uppercase tracking-wide text-primary hover:opacity-80 transition-opacity">Browse jobs →</Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* ── 5. WORLDS COLLIDE (static only, effective industries) ── */}
              {staticIntersections.length > 0 && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(120,100%,45%)" }}>
                      <Shuffle className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Where your worlds collide</h2>
                      <p className="font-body text-xs text-muted-foreground">
                        Roles at the intersection of{" "}
                        {effectiveIndustryNames.slice(0, 3).join(", ")}
                        {effectiveIndustryNames.length > 3 ? ` +${effectiveIndustryNames.length - 3} more` : ""}
                        {hasDesiredIndustries ? " (your chosen industries)" : " (from your CV)"}
                      </p>
                    </div>
                  </div>

                  {profile.skillCategories.length > 0 && (
                    <div className="flex items-center gap-2 mb-5 mt-3 flex-wrap">
                      <span className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground">Filtered by your skill mix:</span>
                      {profile.skillCategories.map((sk) => (
                        <span key={sk} className="px-2.5 py-0.5 rounded-full font-display font-700 text-[10px] uppercase tracking-wide border-2 text-black" style={{ borderColor: "hsl(120,100%,45%)", background: "hsl(120,100%,45%,0.15)" }}>
                          {SKILL_LABELS[sk].emoji} {SKILL_LABELS[sk].label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {staticIntersections.slice(0, 6).map((s, i) => {
                      const slug = INDUSTRY_SLUGS[s.industry2 || s.industry1] || (s.industry2 || s.industry1).toLowerCase();
                      return (
                        <div key={`${s.blend}-${i}`} className="relative border-2 border-dashed rounded-2xl p-4 flex flex-col gap-3" style={{ borderColor: "hsl(120,100%,45%)", background: "hsl(120,100%,45%,0.05)" }}>
                          <span className="inline-flex self-start px-2.5 py-0.5 rounded-full font-display font-900 text-[10px] uppercase tracking-wide text-black" style={{ background: "hsl(120,100%,45%)" }}>
                            {s.blend}
                          </span>
                          <div>
                            <p className="font-display font-900 text-sm uppercase tracking-wide leading-tight mb-1">{s.role}</p>
                            <p className="font-body text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                          </div>
                          {s.example_companies.length > 0 && (
                            <p className="font-body text-[10px] text-muted-foreground/70">eg. {s.example_companies.slice(0, 3).join(" · ")}</p>
                          )}
                          <div className="flex gap-2 mt-auto pt-2 border-t" style={{ borderColor: "hsl(120,100%,45%,0.3)" }}>
                            {slug && <><Link to={`/${slug}`} className="font-display font-700 text-xs uppercase tracking-wide text-foreground hover:text-primary transition-colors">Explore →</Link><span className="text-border select-none">·</span></>}
                            <Link to={`/marketplace?search=${encodeURIComponent(s.keywords[0] || s.role)}`} className="font-display font-700 text-xs uppercase tracking-wide hover:opacity-80 transition-opacity" style={{ color: "hsl(120,100%,35%)" }}>
                              Find jobs →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Not enough data for Worlds Collide */}
              {staticIntersections.length === 0 && (effectiveIndustryNames.length < 2) && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(120,100%,45%)" }}>
                      <Shuffle className="w-4 h-4 text-black" />
                    </div>
                    <h2 className="font-display font-900 text-xl uppercase tracking-wide">Where your worlds collide</h2>
                  </div>
                  <div className="border-2 border-dashed rounded-2xl p-6 text-center" style={{ borderColor: "hsl(120,100%,45%,0.4)" }}>
                    <p className="font-display font-900 text-sm uppercase tracking-wide mb-1">Needs two or more industries</p>
                    <p className="font-body text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
                      Set at least two industry interests, or run Understand Me so we can spot your background industries.
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Link to="/onboarding?step=interests" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-foreground font-display font-700 text-xs uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors">
                        Set interests <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link to="/my-profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-display font-700 text-xs uppercase tracking-wide text-black" style={{ background: "hsl(120,100%,45%)" }}>
                        Run Understand Me <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* ── 6. WHAT IF MACHINE ── */}
              <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
                <RoleMixer userIndustries={effectiveIndustryNames} />
              </motion.section>

              {/* ── 7. SIDE HUSTLES ── */}
              <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.35 }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-900 text-xl uppercase tracking-wide">Side hustle ideas</h2>
                    <p className="font-body text-xs text-muted-foreground">
                      {profile.skillCategories.length > 0
                        ? `Matched to your ${profile.skillCategories.map((sk) => SKILL_LABELS[sk].label).join(" & ")} skills`
                        : "Turn your skills into income outside of 9–5"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sidehustles.map((s) => (
                    <Link key={s.title} to={s.link} className="group border-2 border-foreground/20 bg-background rounded-2xl p-4 hover:bg-primary hover:border-foreground hover:-translate-y-0.5 transition-all">
                      <p className="font-display font-900 text-sm uppercase tracking-wide mb-1">{s.title}</p>
                      <p className="font-body text-xs text-muted-foreground group-hover:text-foreground/80">{s.desc}</p>
                    </Link>
                  ))}
                </div>
                <Link to="/side-hustles" className="inline-flex items-center gap-1.5 mt-3 font-display font-700 text-xs uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                  Explore all side hustles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.section>

              {/* ── Start Something ── */}
              <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
                <div className="border-2 border-foreground rounded-3xl p-6 md:p-8 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Start Something</h2>
                      <p className="font-body text-sm text-muted-foreground mt-1 max-w-md">
                        Got an idea? Everything you need to go from idea to first customer.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="rounded-full shrink-0 border-2 border-foreground">
                    <Link to="/starting-a-business">Explore <ArrowRight className="w-4 h-4 ml-1" /></Link>
                  </Button>
                </div>
              </motion.section>

              {/* ── Bottom CTAs ── */}
              <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.45 }} className="pb-4 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/my-profile">Update my profile <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-foreground">
                  <Link to="/my-jobs">Browse my jobs <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </motion.div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
