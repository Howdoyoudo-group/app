import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, User, Briefcase, Building2, Shuffle, Brain,
  Wallet, Layers, Edit3, MapPin, RefreshCw, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getEffectiveIndustriesTagged, getCvIndustriesTagged, type TaggedIndustry } from "@/lib/profile-matching";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg-industries.jpg";
import howdyMascot from "@/assets/howdy-mascot.png";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

interface RoleMatch { role: string; slug: string; percentage: number; reason: string; }
interface IndustryFit { industry: string; confidence: number; reason: string; }
interface UnderstandMeResult {
  roleMatches?: RoleMatch[];
  industryFit?: IndustryFit[];
  transferableSkills?: string[];
}

type SkillCategory = "creative" | "people" | "digital" | "practical";
const SKILL_LABELS: Record<SkillCategory, { label: string; emoji: string }> = {
  creative: { label: "Creative", emoji: "🎨" },
  people: { label: "People", emoji: "🤝" },
  digital: { label: "Digital", emoji: "💻" },
  practical: { label: "Practical", emoji: "🔧" },
};
const RIASEC_LABELS: Record<string, { label: string; emoji: string }> = {
  R: { label: "Realistic", emoji: "🔧" },
  I: { label: "Investigative", emoji: "🔬" },
  A: { label: "Artistic", emoji: "🎨" },
  S: { label: "Social", emoji: "🤝" },
  E: { label: "Enterprising", emoji: "🚀" },
  C: { label: "Conventional", emoji: "📋" },
};

const TILES: Array<{ title: string; href: string; Icon: React.ElementType; img?: string }> = [
  { title: "Howdy Jobs",          href: "/my-jobs?tab=jobs",                   Icon: Briefcase,  img: howdyMascot },
  { title: "Suggested Roles",     href: "/match-me/suggested-roles",           Icon: Briefcase },
  { title: "Suggested Industries",href: "/match-me/suggested-industries",      Icon: Building2 },
  { title: "Worlds Collide",      href: "/match-me/worlds-collide",            Icon: Shuffle },
  { title: "What If Machine",     href: "/match-me/what-if-machine",           Icon: Brain },
  { title: "Side Hustles",        href: "/side-hustles",                       Icon: Wallet },
];

export default function MatchMe() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [results, setResults] = useState<UnderstandMeResult | null>(null);
  const [riasecScores, setRiasecScores] = useState<Record<string, number> | null>(null);
  const [industryInterests, setIndustryInterests] = useState<string[]>([]);
  const [rolePreferences, setRolePreferences] = useState<string[]>([]);
  const [passions, setPassions] = useState<string[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [selfDeclaredSkills, setSelfDeclaredSkills] = useState<string[]>([]);
  const [careerLevel, setCareerLevel] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);

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
      setPassions(Array.from(new Set(passionArr)).slice(0, 10));
      setTargetCompanies(Array.isArray(pb.targetCompanies) ? pb.targetCompanies.slice(0, 6) : []);
      setCareerLevel(pb.careerLevel || jp.careerLevel || null);
      setLocation(pb.location || jp.location || jp.preferredLocation || null);

      const skillsObj: any = pb.skills || {};
      setSelfDeclaredSkills([
        ...(Array.isArray(skillsObj.creative) ? skillsObj.creative : []),
        ...(Array.isArray(skillsObj.people) ? skillsObj.people : []),
        ...(Array.isArray(skillsObj.digital) ? skillsObj.digital : []),
        ...(Array.isArray(skillsObj.practical) ? skillsObj.practical : []),
      ].slice(0, 12));

      setRiasecScores((data as any)?.riasec_scores || null);
      const inds: string[] = data?.industry_interests || [];
      const roles: string[] = data?.role_preferences || [];
      setIndustryInterests(inds);
      setRolePreferences(roles);

      const roleLower = roles.map((r) => r.toLowerCase());
      const cats: SkillCategory[] = [];
      if (roleLower.some((r) => ["creative","marketing","content","brand","design","media","influenc"].some((k) => r.includes(k)))) cats.push("creative");
      if (roleLower.some((r) => ["people","hr","culture","talent","coaching","community","partnerships","sales","commercial"].some((k) => r.includes(k)))) cats.push("people");
      if (roleLower.some((r) => ["strategy","product","data","digital","tech","e-commerce","analytics","operations","project"].some((k) => r.includes(k)))) cats.push("digital");
      if (roleLower.some((r) => ["operations","production","logistics","project","event","facilities","practical"].some((k) => r.includes(k)))) cats.push("practical");
      if (cats.length === 0) {
        if (Array.isArray(skillsObj.creative) && skillsObj.creative.length > 0) cats.push("creative");
        if (Array.isArray(skillsObj.people) && skillsObj.people.length > 0) cats.push("people");
        if (Array.isArray(skillsObj.digital) && skillsObj.digital.length > 0) cats.push("digital");
        if (Array.isArray(skillsObj.practical) && skillsObj.practical.length > 0) cats.push("practical");
      }
      setSkillCategories(cats);
      setLoading(false);
    })();
  }, [user]);

  const hasResults = !!(results?.roleMatches?.length || results?.industryFit?.length);
  const topRiasec = riasecScores
    ? (Object.entries(riasecScores) as [string, number][]).sort((a, b) => b[1] - a[1])
    : [];

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
              <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                {firstName ? `Here's your picture,\n${firstName}.` : "Here's your\nbig picture."}
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                Everything we know about you, how we use it, and where it could take you.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto py-10 space-y-10">

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && !user && (
            <motion.div {...fadeUp} className="text-center py-16 border-2 border-dashed border-foreground/20 rounded-3xl">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display font-900 text-2xl mb-2">Sign in to see your matches</h2>
              <p className="font-body text-muted-foreground mb-6">Create your profile and we'll match you to roles and opportunities.</p>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/auth">Sign in / Create account <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </motion.div>
          )}

          {!loading && user && (
            <>
              {/* ── What We Know ── */}
              <motion.section {...fadeUp}>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">What Howdy knows about you</h2>
                      <p className="font-body text-xs text-muted-foreground">The signals we use to match your opportunities</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to="/onboarding"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 font-display font-700 text-xs uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Rerun
                    </Link>
                    <Link
                      to="/my-profile"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground/20 font-display font-700 text-xs uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* From CV */}
                  <div className="border-2 border-blue-200 rounded-2xl p-4 bg-blue-50/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-display font-700 text-[10px] uppercase tracking-widest text-blue-600">From your CV</p>
                      {!hasResults && (
                        <Link to="/my-profile" className="font-display font-700 text-[10px] uppercase tracking-widest text-blue-500 underline">Run Understand Me →</Link>
                      )}
                    </div>
                    {hasResults ? (
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

                    {(careerLevel || location) && (
                      <div className="flex flex-wrap gap-2">
                        {careerLevel && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-foreground/20 font-display font-700 text-xs">
                            <Briefcase className="w-3 h-3 text-muted-foreground" /> {careerLevel}
                          </span>
                        )}
                        {location && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-foreground/20 font-display font-700 text-xs">
                            <MapPin className="w-3 h-3 text-muted-foreground" /> {location}
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
                          {topRiasec.map(([k, v]) => (
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
              </motion.section>

              {/* ── Explore More ── */}
              <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
                <h2 className="font-display font-900 text-sm uppercase tracking-widest text-muted-foreground mb-4">Explore your matches</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {TILES.map((tile) => (
                    <Link
                      key={tile.title}
                      to={tile.href}
                      className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
                    >
                      {tile.img ? (
                        <img src={tile.img} alt="" className="w-12 h-12 object-contain" loading="lazy" />
                      ) : (
                        <tile.Icon className="w-10 h-10 text-foreground" strokeWidth={1.25} />
                      )}
                      <span className="font-display font-700 text-[10px] leading-tight tracking-tight text-foreground">
                        {tile.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
