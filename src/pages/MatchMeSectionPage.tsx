// Separate pages for each Match Me section, accessed via /match-me/:section
// Sections: suggested-roles | suggested-industries | worlds-collide | what-if-machine

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, Building2, Shuffle, Zap, Brain, Layers, Edit3, RefreshCw, MapPin, CheckCircle2, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getMatchingIntersections, type SkillCategory, type IntersectionRole } from "@/data/intersection-roles";
import { getEffectiveIndustriesTagged, getCvIndustriesTagged, type TaggedIndustry } from "@/lib/profile-matching";
import { RoleMixer } from "@/components/RoleMixer";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const INDUSTRY_SLUGS: Record<string, string> = {
  "Beauty": "beauty", "Beer & Drinks": "beer", "Cars": "cars", "Cinema & Film": "cinema",
  "Coffee": "coffee", "Fashion": "fashion", "Football": "football", "Gaming": "gaming",
  "Grocery": "grocery", "Health": "health", "Hospitality": "hospitality",
  "Influencing": "influencing", "Interior Design": "interior-design",
  "Jewellery": "jewellery", "Journalism": "journalism", "Money": "money",
  "Music": "music", "Pets": "pets", "Physiotherapy": "physiotherapy",
  "Psychotherapy": "psychotherapy", "Teaching": "teaching", "Travel": "travel",
  "Wellness": "wellness", "Formula 1": "formula-1", "Farming": "farming",
  "Charity": "charity", "Estate Agency": "estate-agency", "Horse Racing": "horse-racing",
  "Bakery": "bakery", "Footwear": "footwear",
};

const SKILL_LABELS: Record<SkillCategory, { label: string; emoji: string }> = {
  creative: { label: "Creative", emoji: "🎨" },
  people: { label: "People", emoji: "🤝" },
  digital: { label: "Digital", emoji: "💻" },
  practical: { label: "Practical", emoji: "🔧" },
};

interface RoleMatch { role: string; slug: string; percentage: number; reason: string; }
interface IndustryFit { industry: string; confidence: number; reason: string; }
interface UnderstandMeResult {
  roleMatches?: RoleMatch[];
  industryFit?: IndustryFit[];
  transferableSkills?: string[];
}

const SIDE_HUSTLE_IDEAS: { title: string; desc: string; tags: SkillCategory[]; why: string }[] = [
  { title: "Freelance Design", desc: "Logos, social graphics, presentations. Start on Fiverr or direct to small businesses.", tags: ["creative"], why: "You have Creative skills" },
  { title: "Content Creation", desc: "Build an audience around something you know. Monetise through brand deals or courses.", tags: ["creative", "digital"], why: "Matches your Creative + Digital mix" },
  { title: "Tutoring & Teaching", desc: "Share what you know. Tutor students, teach skills online, or run workshops.", tags: ["people"], why: "You're a people person" },
  { title: "Social Media Management", desc: "Help local businesses grow their online presence — a learnable, in-demand skill.", tags: ["digital", "creative"], why: "Matches your Digital + Creative skills" },
  { title: "Photography & Video", desc: "Events, portraits, product shots. Equipment costs are falling. Talent travels.", tags: ["creative", "practical"], why: "Good fit for Creative + Practical skills" },
  { title: "Copywriting & Content", desc: "Write for brands, blogs and websites. One of the most flexible digital skills.", tags: ["creative", "digital"], why: "Matches your Creative + Digital mix" },
  { title: "Handyman & Local Services", desc: "Painting, flat-pack, garden work. Task-based apps like TaskRabbit make it easy to start.", tags: ["practical"], why: "Suits your Practical skills" },
  { title: "Virtual Assistant", desc: "Admin, inbox management, scheduling. Remote and flexible with low startup costs.", tags: ["digital", "people"], why: "Matches your Digital + People skills" },
  { title: "Event Support", desc: "Staffing, door work, production crew. Great for people who like being in the room.", tags: ["people", "practical"], why: "Good fit for People + Practical skills" },
];

const RIASEC_LABELS: Record<string, { label: string; emoji: string }> = {
  R: { label: "Realistic", emoji: "🔧" }, I: { label: "Investigative", emoji: "🔬" },
  A: { label: "Artistic", emoji: "🎨" }, S: { label: "Social", emoji: "🤝" },
  E: { label: "Enterprising", emoji: "🚀" }, C: { label: "Conventional", emoji: "📋" },
};

const SECTION_META: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
  "what-we-know": { title: "What Howdy Knows About You", subtitle: "The signals we use to match your opportunities", icon: Layers },
  "suggested-roles": { title: "Suggested Roles", subtitle: "Based on your CV — roles your experience maps to", icon: Briefcase },
  "suggested-industries": { title: "Suggested Industries", subtitle: "Based on your CV — sectors where your background fits", icon: Building2 },
  "worlds-collide": { title: "Where Your Worlds Collide", subtitle: "Roles at the crossover of your industries and skills", icon: Shuffle },
  "what-if-machine": { title: "The What If Machine", subtitle: "Explore any combination of industries and roles", icon: Brain },
  "side-hustles": { title: "Side Hustle Ideas", subtitle: "Flexible ways to earn alongside your career, matched to your skills", icon: Wallet },
};

export default function MatchMeSectionPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<UnderstandMeResult | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [effectiveIndustries, setEffectiveIndustries] = useState<TaggedIndustry[]>([]);
  // what-we-know specific
  const [riasecScores, setRiasecScores] = useState<Record<string, number> | null>(null);
  const [industryInterests, setIndustryInterests] = useState<string[]>([]);
  const [rolePreferences, setRolePreferences] = useState<string[]>([]);
  const [passions, setPassions] = useState<string[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [selfDeclaredSkills, setSelfDeclaredSkills] = useState<string[]>([]);
  const [careerLevel, setCareerLevel] = useState<string | null>(null);
  const [locationVal, setLocationVal] = useState<string | null>(null);

  useEffect(() => {
    if (!section || !(section in SECTION_META)) {
      navigate("/match-me", { replace: true });
      return;
    }
    if (!user) { setLoading(false); return; }

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("understand_me_results, industry_interests, role_preferences, job_preferences, riasec_scores")
        .eq("id", user.id)
        .maybeSingle();

      const umr = (data as any)?.understand_me_results || null;
      setResults(umr);
      setRiasecScores((data as any)?.riasec_scores || null);

      const industryInterests: string[] = data?.industry_interests || [];
      const rolePrefs: string[] = data?.role_preferences || [];
      setIndustryInterests(industryInterests);
      setRolePreferences(rolePrefs);
      const jp = (data as any)?.job_preferences || {};
      const pb = jp.profileBuilder || {};
      const skillsObj: any = pb.skills || {};

      const passionArr: string[] = [
        ...(Array.isArray(jp.passions) ? jp.passions : []),
        ...(typeof jp.passionsText === "string" ? jp.passionsText.split(/[,\n]+/).map((s: string) => s.trim()).filter(Boolean) : []),
        ...(Array.isArray(pb.passions) ? pb.passions : []),
      ];
      setPassions(Array.from(new Set(passionArr)).slice(0, 10));
      setTargetCompanies(Array.isArray(pb.targetCompanies) ? pb.targetCompanies.slice(0, 6) : []);
      setCareerLevel(pb.careerLevel || jp.careerLevel || null);
      setLocationVal(pb.location || jp.location || jp.preferredLocation || null);
      setSelfDeclaredSkills([
        ...(Array.isArray(skillsObj.creative) ? skillsObj.creative : []),
        ...(Array.isArray(skillsObj.people) ? skillsObj.people : []),
        ...(Array.isArray(skillsObj.digital) ? skillsObj.digital : []),
        ...(Array.isArray(skillsObj.practical) ? skillsObj.practical : []),
      ].slice(0, 12));

      const rolePrefLower = rolePrefs.map((r) => r.toLowerCase());
      const cats: SkillCategory[] = [];
      if (rolePrefLower.some((r) => ["creative", "marketing", "content", "brand", "design", "media", "influenc"].some((k) => r.includes(k)))) cats.push("creative");
      if (rolePrefLower.some((r) => ["people", "hr", "culture", "talent", "coaching", "community", "partnerships", "sales", "commercial"].some((k) => r.includes(k)))) cats.push("people");
      if (rolePrefLower.some((r) => ["strategy", "product", "data", "digital", "tech", "e-commerce", "analytics", "operations", "project"].some((k) => r.includes(k)))) cats.push("digital");
      if (rolePrefLower.some((r) => ["operations", "production", "logistics", "project", "event", "facilities", "practical"].some((k) => r.includes(k)))) cats.push("practical");
      if (cats.length === 0) {
        if (Array.isArray(skillsObj.creative) && skillsObj.creative.length > 0) cats.push("creative");
        if (Array.isArray(skillsObj.people) && skillsObj.people.length > 0) cats.push("people");
        if (Array.isArray(skillsObj.digital) && skillsObj.digital.length > 0) cats.push("digital");
        if (Array.isArray(skillsObj.practical) && skillsObj.practical.length > 0) cats.push("practical");
      }
      setSkillCategories(cats);
      setEffectiveIndustries(getEffectiveIndustriesTagged(industryInterests, umr));
      setLoading(false);
    })();
  }, [user, section]);

  const meta = SECTION_META[section ?? ""] ?? null;
  const Icon = meta?.icon ?? Zap;

  const effectiveIndustryNames = effectiveIndustries.map((i) => i.name);
  const industrySlugSet = new Set(effectiveIndustryNames.map((i) => INDUSTRY_SLUGS[i] || i.toLowerCase()));
  const worldsCollide: IntersectionRole[] = getMatchingIntersections(
    Array.from(industrySlugSet),
    skillCategories,
    [],
  );

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto py-10">

          {/* Back link */}
          <Link to="/match-me" className="inline-flex items-center gap-1.5 font-display font-700 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Match Me
          </Link>

          {meta && (
            <motion.div {...fadeUp} className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-900 text-2xl md:text-3xl uppercase tracking-tight">{meta.title}</h1>
                <p className="font-body text-sm text-muted-foreground">{meta.subtitle}</p>
              </div>
            </motion.div>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && !user && (
            <div className="text-center py-16 border-2 border-dashed border-foreground/20 rounded-3xl">
              <p className="font-display font-900 text-xl mb-3">Sign in to see your matches</p>
              <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-display font-700 text-sm">
                Sign in <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* what-we-know: Edit + Rerun buttons in header */}
          {section === "what-we-know" && meta && (
            <div className="flex gap-2 mb-6">
              <Link to="/onboarding" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 font-display font-700 text-xs uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors">
                <RefreshCw className="w-3 h-3" /> Rerun onboarding
              </Link>
              <Link to="/my-profile" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground/20 font-display font-700 text-xs uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors">
                <Edit3 className="w-3 h-3" /> Edit profile
              </Link>
            </div>
          )}

          {!loading && user && (
            <motion.div {...fadeUp}>
              {/* ── WHAT WE KNOW ── */}
              {section === "what-we-know" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* From CV */}
                  <div className="border-2 border-blue-200 rounded-2xl p-4 bg-blue-50/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-display font-700 text-[10px] uppercase tracking-widest text-blue-600">From your CV</p>
                      {!(results?.roleMatches?.length || results?.industryFit?.length) && (
                        <Link to="/my-profile" className="font-display font-700 text-[10px] uppercase tracking-widest text-blue-500 underline">Run Understand Me →</Link>
                      )}
                    </div>
                    {(results?.roleMatches?.length || results?.industryFit?.length) ? (
                      <>
                        {results!.industryFit && results!.industryFit.length > 0 && (
                          <div>
                            <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Experience industries</p>
                            <div className="flex flex-wrap gap-1.5">
                              {results!.industryFit.slice(0, 5).map((ind) => (
                                <span key={ind.industry} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200 font-display font-700 text-xs text-blue-700">
                                  {ind.industry}<span className="opacity-50 text-[9px] ml-0.5">{ind.confidence}%</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {results!.roleMatches && results!.roleMatches.length > 0 && (
                          <div>
                            <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Experience roles</p>
                            <div className="flex flex-wrap gap-1.5">
                              {results!.roleMatches.slice(0, 4).map((r) => (
                                <span key={r.slug} className="px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200 font-display font-700 text-xs text-blue-700">{r.role}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {results!.transferableSkills && results!.transferableSkills.length > 0 && (
                          <div>
                            <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Transferable skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {results!.transferableSkills.slice(0, 6).map((sk) => (
                                <span key={sk} className="px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200 font-display font-700 text-xs text-blue-700">{sk}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="font-body text-xs text-muted-foreground">Upload your CV on your profile page and we'll analyse your background, spot your industries and suggest matching roles.</p>
                    )}
                  </div>

                  {/* You told us */}
                  <div className="border-2 border-primary/20 rounded-2xl p-4 bg-primary/5 space-y-4">
                    <p className="font-display font-700 text-[10px] uppercase tracking-widest text-primary">You told us</p>
                    <div>
                      <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Desired industries</p>
                      {industryInterests.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {industryInterests.map((ind) => (
                            <span key={ind} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 font-display font-700 text-xs text-primary">{ind}</span>
                          ))}
                        </div>
                      ) : (
                        <Link to="/onboarding?step=interests" className="font-body text-xs text-primary underline">Add desired industries →</Link>
                      )}
                    </div>
                    <div>
                      <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Desired roles</p>
                      {rolePreferences.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {rolePreferences.map((r) => (
                            <span key={r} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 font-display font-700 text-xs text-primary">{r}</span>
                          ))}
                        </div>
                      ) : (
                        <Link to="/onboarding?step=roles" className="font-body text-xs text-primary underline">Add dream roles →</Link>
                      )}
                    </div>
                    {passions.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Passions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {passions.slice(0, 6).map((p) => (
                            <span key={p} className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 font-display font-700 text-xs text-amber-800">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {targetCompanies.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Dream companies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {targetCompanies.map((c) => (
                            <span key={c} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 font-display font-700 text-xs text-primary">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selfDeclaredSkills.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Self-declared skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selfDeclaredSkills.slice(0, 6).map((sk) => (
                            <span key={sk} className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 font-display font-700 text-xs text-purple-700">{sk}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(careerLevel || locationVal) && (
                      <div className="flex flex-wrap gap-2">
                        {careerLevel && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-foreground/20 font-display font-700 text-xs">
                            <Briefcase className="w-3 h-3 text-muted-foreground" /> {careerLevel}
                          </span>
                        )}
                        {locationVal && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-foreground/20 font-display font-700 text-xs">
                            <MapPin className="w-3 h-3 text-muted-foreground" /> {locationVal}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Personality */}
                  <div className="border-2 border-purple-200 rounded-2xl p-4 bg-purple-50/40 space-y-4">
                    <p className="font-display font-700 text-[10px] uppercase tracking-widest text-purple-600">Your personality</p>
                    {riasecScores ? (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-3">RIASEC profile</p>
                        <div className="space-y-2">
                          {(Object.entries(riasecScores) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                            <div key={k}>
                              <div className="flex justify-between mb-0.5">
                                <span className="font-display font-700 text-xs">{RIASEC_LABELS[k]?.emoji} {RIASEC_LABELS[k]?.label ?? k}</span>
                                <span className="font-display font-700 text-xs text-purple-600">{Math.round(v)}</span>
                              </div>
                              <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-body text-xs text-muted-foreground mb-3">Take the 12-question quiz to add your personality type and improve your job matches.</p>
                        <Link to="/onboarding?step=personality" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-purple-600 text-white font-display font-700 text-xs">
                          Take the quiz <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                    {skillCategories.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Skill type</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skillCategories.map((sk) => (
                            <span key={sk} className="px-2.5 py-1 rounded-full bg-purple-100 border border-purple-200 font-display font-700 text-xs text-purple-700">
                              {SKILL_LABELS[sk].emoji} {SKILL_LABELS[sk].label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SUGGESTED ROLES ── */}
              {section === "suggested-roles" && (
                <>
                  {results?.roleMatches && results.roleMatches.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {results.roleMatches.map((m) => (
                        <div key={m.slug} className="relative border-2 border-blue-200 bg-blue-50/30 rounded-2xl p-4 flex flex-col gap-3 overflow-hidden group hover:-translate-y-0.5 transition-transform">
                          <div className="absolute bottom-0 left-0 h-0.5 bg-blue-400/50" style={{ width: `${m.percentage}%` }} />
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-display font-900 text-sm uppercase tracking-wide leading-tight">{m.role}</span>
                            <span className="font-display font-900 text-base text-blue-600 shrink-0">{m.percentage}%</span>
                          </div>
                          <p className="font-body text-xs text-muted-foreground line-clamp-2 flex-1">{m.reason}</p>
                          <div className="flex gap-3 pt-2 border-t border-blue-100">
                            <Link to={`/roles/${m.slug}`} className="font-display font-700 text-xs uppercase tracking-wide text-foreground hover:text-primary transition-colors">Explore →</Link>
                            <Link to={`/marketplace?role=${encodeURIComponent(m.role)}`} className="font-display font-700 text-xs uppercase tracking-wide text-primary hover:opacity-80">Find jobs →</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                      <p className="font-display font-700 text-base mb-2">No CV analysis yet</p>
                      <p className="font-body text-sm text-muted-foreground mb-4">Upload your CV on your profile to get suggested roles from your experience.</p>
                      <Link to="/my-profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-display font-700 text-xs">
                        Go to profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* ── SUGGESTED INDUSTRIES ── */}
              {section === "suggested-industries" && (
                <>
                  {results?.industryFit && results.industryFit.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.industryFit.map((ind) => {
                        const slug = INDUSTRY_SLUGS[ind.industry];
                        return (
                          <div key={ind.industry} className="relative border-2 border-blue-200 bg-blue-50/30 rounded-2xl p-5 flex flex-col gap-3 overflow-hidden hover:-translate-y-0.5 transition-transform">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-display font-900 text-base uppercase tracking-wide">{ind.industry}</span>
                              <span className="font-display font-900 text-base text-blue-600 shrink-0">{ind.confidence}%</span>
                            </div>
                            <p className="font-body text-sm text-muted-foreground">{ind.reason}</p>
                            <div className="flex gap-3 pt-2 border-t border-blue-100">
                              {slug && <><Link to={`/${slug}`} className="font-display font-700 text-xs uppercase tracking-wide text-foreground hover:text-primary transition-colors">Explore →</Link><span className="text-border">·</span></>}
                              <Link to={`/marketplace?industry=${encodeURIComponent(ind.industry)}`} className="font-display font-700 text-xs uppercase tracking-wide text-primary hover:opacity-80">Browse jobs →</Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                      <p className="font-display font-700 text-base mb-2">No CV analysis yet</p>
                      <p className="font-body text-sm text-muted-foreground mb-4">Upload your CV and run Understand Me to get suggested industries.</p>
                      <Link to="/my-profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-display font-700 text-xs">
                        Go to profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* ── WORLDS COLLIDE ── */}
              {section === "worlds-collide" && (
                <>
                  {skillCategories.length > 0 && (
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      <span className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground">Filtered by:</span>
                      {skillCategories.map((sk) => (
                        <span key={sk} className="px-2.5 py-0.5 rounded-full font-display font-700 text-[10px] uppercase tracking-wide border-2 text-black" style={{ borderColor: "hsl(120,100%,45%)", background: "hsl(120,100%,45%,0.15)" }}>
                          {SKILL_LABELS[sk].emoji} {SKILL_LABELS[sk].label}
                        </span>
                      ))}
                    </div>
                  )}
                  {worldsCollide.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {worldsCollide.map((s, i) => {
                        const slug = INDUSTRY_SLUGS[s.industry2 || s.industry1] || (s.industry2 || s.industry1);
                        const searchQ = s.keywords[0] || s.role;
                        return (
                          <Link
                            key={`${s.blend}-${i}`}
                            to={`/marketplace?search=${encodeURIComponent(searchQ)}`}
                            className="group relative border-2 border-dashed rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-all duration-200"
                            style={{ borderColor: "hsl(120,100%,45%)", background: "hsl(120,100%,45%,0.05)" }}
                          >
                            <span className="inline-flex self-start px-2 py-0.5 rounded-full font-display font-900 text-[10px] uppercase tracking-wide text-black" style={{ background: "hsl(120,100%,45%)" }}>
                              {s.blend}
                            </span>
                            <div>
                              <p className="font-display font-900 text-sm uppercase tracking-wide leading-tight mb-1.5 group-hover:text-primary transition-colors">{s.role}</p>
                              <p className="font-body text-xs text-muted-foreground line-clamp-3">{s.description}</p>
                            </div>
                            {s.example_companies.length > 0 && (
                              <p className="font-body text-[10px] text-muted-foreground/60 mt-auto">eg. {s.example_companies.slice(0, 2).join(" · ")}</p>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "hsl(120,100%,45%,0.3)" }}>
                              <span className="font-display font-700 text-xs uppercase tracking-wide" style={{ color: "hsl(120,100%,30%)" }}>Find jobs →</span>
                              {slug && (
                                <span onClick={(e) => { e.preventDefault(); window.location.href = `/${slug}`; }} className="font-display font-700 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors">Explore</span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-2xl p-8 text-center" style={{ borderColor: "hsl(120,100%,45%,0.4)" }}>
                      <p className="font-display font-900 text-sm uppercase tracking-wide mb-2">Needs two or more industries</p>
                      <p className="font-body text-xs text-muted-foreground mb-4 max-w-sm mx-auto">Set at least two industry interests, or run Understand Me so we can spot your industries from your CV.</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Link to="/onboarding?step=interests" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-foreground font-display font-700 text-xs uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors">
                          Set interests <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link to="/my-profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-display font-700 text-xs uppercase tracking-wide text-black" style={{ background: "hsl(120,100%,45%)" }}>
                          Run Understand Me <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── WHAT IF MACHINE ── */}
              {section === "what-if-machine" && (
                <RoleMixer userIndustries={effectiveIndustryNames} />
              )}

              {/* ── SIDE HUSTLES ── */}
              {section === "side-hustles" && (() => {
                const ranked = [...SIDE_HUSTLE_IDEAS]
                  .map((s) => ({
                    ...s,
                    score: s.tags.filter((t) => skillCategories.includes(t)).length,
                    whyText: skillCategories.length > 0 ? s.why : "Popular with career changers",
                  }))
                  .sort((a, b) => b.score - a.score);
                return (
                  <>
                    {skillCategories.length > 0 && (
                      <p className="font-body text-sm text-muted-foreground mb-5">
                        Ranked for your <strong>{skillCategories.map((s) => SKILL_LABELS[s].label).join(" + ")}</strong> skill mix — highest match first.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {ranked.map((s) => (
                        <Link key={s.title} to="/side-hustles" className="group border-2 border-foreground/20 bg-background rounded-2xl p-5 flex flex-col gap-2 hover:bg-primary hover:border-foreground hover:-translate-y-0.5 transition-all">
                          <p className="font-display font-900 text-sm uppercase tracking-wide">{s.title}</p>
                          <p className="font-body text-xs text-muted-foreground group-hover:text-foreground/80 flex-1">{s.desc}</p>
                          <div className="flex items-center gap-1.5 pt-2 border-t border-foreground/10 group-hover:border-foreground/20 mt-auto">
                            <CheckCircle2 className="w-3 h-3 text-primary group-hover:text-foreground shrink-0" />
                            <span className="font-display font-700 text-[10px] uppercase tracking-wide text-primary group-hover:text-foreground">{s.whyText}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link to="/side-hustles" className="inline-flex items-center gap-1.5 font-display font-700 text-xs uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                      Explore all side hustles <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                );
              })()}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
