import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Briefcase, Building2, Lightbulb, Zap, Rocket, User, Heart, Target, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface RoleMatch {
  role: string;
  slug: string;
  percentage: number;
  reason: string;
}

interface IndustryFit {
  industry: string;
  confidence: number;
  reason: string;
}

interface UnderstandMeResult {
  roleMatches?: RoleMatch[];
  industryFit?: IndustryFit[];
  transferableSkills?: string[];
  personalityInsights?: string;
  suggestedNextSteps?: { action: string; link: string; type: string }[];
}

const INDUSTRY_SLUGS: Record<string, string> = {
  "Beauty": "beauty",
  "Beer & Drinks": "beer",
  "Cars": "cars",
  "Cinema & Film": "cinema",
  "Coffee": "coffee",
  "Fashion": "fashion",
  "Football": "football",
  "Gaming": "gaming",
  "Grocery": "grocery",
  "Health": "health",
  "Hospitality": "hospitality",
  "Influencing": "influencing",
  "Interior Design": "interior-design",
  "Jewellery": "jewellery",
  "Journalism": "journalism",
  "Money": "money",
  "Music": "music",
  "Pets": "pets",
  "Physiotherapy": "physiotherapy",
  "Psychotherapy": "psychotherapy",
  "Teaching": "teaching",
  "Travel": "travel",
  "Wellness": "wellness",
  "Formula 1": "formula-1",
  "Farming": "farming",
  "Charity": "charity",
  "Estate Agency": "estate-agency",
  "Horse Racing": "horse-racing",
  "Bakery": "bakery",
  "Footwear": "footwear",
};

const SIDE_HUSTLE_IDEAS = [
  { title: "Freelance Design", desc: "Logos, social graphics, presentations. Start on Fiverr or direct to small businesses.", link: "/side-hustles" },
  { title: "Content Creation", desc: "Build an audience around something you know. Monetise through brand deals or courses.", link: "/side-hustles" },
  { title: "Tutoring & Teaching", desc: "Share what you know. Tutor students, teach skills online, or run workshops.", link: "/side-hustles" },
  { title: "Social Media Management", desc: "Help local businesses grow their online presence — a learnable, in-demand skill.", link: "/side-hustles" },
  { title: "Photography & Video", desc: "Events, portraits, product shots. Equipment costs are falling. Talent travels.", link: "/side-hustles" },
  { title: "Copywriting & Content", desc: "Write for brands, blogs and websites. One of the most flexible digital skills.", link: "/side-hustles" },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

interface ProfileContext {
  riasecScores: Record<string, number> | null;
  workValues: Record<string, number> | null;
  passions: string[];
  industryInterests: string[];
  rolePreferences: string[];
  targetCompanies: string[];
  hasQuiz: boolean;
  hasInterests: boolean;
}

const RIASEC_LABELS: Record<string, { label: string; desc: string }> = {
  R: { label: "Realistic", desc: "Practical, hands-on" },
  I: { label: "Investigative", desc: "Analytical, curious" },
  A: { label: "Artistic", desc: "Creative, expressive" },
  S: { label: "Social", desc: "Helpful, collaborative" },
  E: { label: "Enterprising", desc: "Leadership, persuasive" },
  C: { label: "Conventional", desc: "Organised, detail-focused" },
};

export default function MatchMe() {
  const { user } = useAuth();
  const [results, setResults] = useState<UnderstandMeResult | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileContext>({
    riasecScores: null, workValues: null, passions: [], industryInterests: [],
    rolePreferences: [], targetCompanies: [], hasQuiz: false, hasInterests: false,
  });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("understand_me_results, full_name, riasec_scores, work_values, industry_interests, role_preferences, job_preferences")
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
      const riasec = (data as any)?.riasec_scores as Record<string, number> | null;
      const industryInterests: string[] = data?.industry_interests || [];
      const rolePrefs: string[] = data?.role_preferences || [];

      setProfile({
        riasecScores: riasec,
        workValues: (data as any)?.work_values as Record<string, number> | null,
        passions: uniquePassions,
        industryInterests,
        rolePreferences: rolePrefs,
        targetCompanies,
        hasQuiz: !!riasec,
        hasInterests: industryInterests.length > 0 || rolePrefs.length > 0 || uniquePassions.length > 0,
      });

      setLoading(false);
    })();
  }, [user]);

  const hasResults = results && (
    (results.roleMatches && results.roleMatches.length > 0) ||
    (results.industryFit && results.industryFit.length > 0)
  );

  // Pick 3 side hustle suggestions deterministically based on industry interests
  const sidehustles = SIDE_HUSTLE_IDEAS.slice(0, 3);

  return (
    <>
      <SEO title="Match Me | Howdoyoudo?" description="Discover the roles, industries and opportunities that match who you are." />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-12 max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">Your matches</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground">
              {firstName ? `Here's where you\ncould go, ${firstName}.` : "Here's where\nyou could go."}
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
              Based on your profile, personality and what you've told us — these are the paths that fit.
            </p>
          </motion.div>

          {loading && (
            <div className="flex justify-center py-16">
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

          {!loading && user && !hasResults && (
            <motion.div {...fadeUp} className="space-y-4">
              <div className="border-2 border-dashed border-foreground/20 rounded-3xl p-8 text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="font-display font-900 text-2xl mb-2">Two ways to unlock your matches</h2>
                <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
                  The more we know about you, the better your matches. Start with the personality quiz — then tell us about your background.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                  <div className="border-2 border-primary rounded-2xl p-5 bg-primary/5 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-900 text-base">Take the quiz</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        12 questions. Discover your RIASEC personality type — the same model used by careers professionals worldwide.
                      </p>
                    </div>
                    <Button asChild className="rounded-full mt-auto">
                      <Link to="/onboarding?step=personality">Take the Quiz <ArrowRight className="w-4 h-4 ml-2" /></Link>
                    </Button>
                  </div>
                  <div className="border-2 border-foreground rounded-2xl p-5 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-900 text-base">Understand Me</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        Upload your CV or paste your LinkedIn profile — we'll analyse your background and match you to roles and industries.
                      </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-full mt-auto border-2 border-foreground">
                      <Link to="/my-profile">Go to my profile <ArrowRight className="w-4 h-4 ml-2" /></Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Show what we already know about them */}
              {profile.hasInterests && (
                <div className="border-2 border-foreground/10 rounded-3xl p-6 bg-muted/30">
                  <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-4">What you've already told us</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {profile.industryInterests.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" /> Industries
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.industryInterests.map((ind) => {
                            const slug = INDUSTRY_SLUGS[ind];
                            return slug ? (
                              <Link key={ind} to={`/${slug}`} className="px-2.5 py-1 rounded-full border border-foreground/20 font-display font-700 text-xs bg-background hover:bg-foreground hover:text-background transition-colors">{ind} →</Link>
                            ) : (
                              <span key={ind} className="px-2.5 py-1 rounded-full border border-foreground/20 font-display font-700 text-xs bg-background">{ind}</span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {profile.rolePreferences.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Target className="w-3 h-3" /> Dream roles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.rolePreferences.map((r) => (
                            <span key={r} className="px-2.5 py-1 rounded-full border border-foreground/20 font-display font-700 text-xs bg-background">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.passions.length > 0 && (
                      <div>
                        <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Heart className="w-3 h-3" /> Passions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.passions.slice(0, 6).map((p) => (
                            <span key={p} className="px-2.5 py-1 rounded-full border border-foreground/20 font-display font-700 text-xs bg-background">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-4">
                    Complete the quiz and Understand Me above — we'll factor all of this into your matches.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {!loading && hasResults && (
            <div className="space-y-12">

              {/* Role Matches */}
              {results!.roleMatches && results!.roleMatches.length > 0 && (
                <motion.section {...fadeUp}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Role Matches</h2>
                      <p className="font-body text-xs text-muted-foreground">Jobs that fit who you are</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results!.roleMatches.slice(0, 6).map((m) => (
                      <div key={m.slug} className="border-2 border-foreground bg-background rounded-2xl p-4 flex flex-col gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-display font-900 text-sm uppercase tracking-wide">{m.role}</span>
                            <span className="font-display font-900 text-lg text-primary">{m.percentage}%</span>
                          </div>
                          <p className="font-body text-xs text-muted-foreground line-clamp-2">{m.reason}</p>
                        </div>
                        <div className="flex gap-2 mt-auto pt-1 border-t border-border">
                          <Link
                            to={`/roles/${m.slug}`}
                            className="font-display font-700 text-xs uppercase tracking-wide text-foreground hover:text-primary transition-colors"
                          >
                            Explore role →
                          </Link>
                          <span className="text-border">·</span>
                          <Link
                            to={`/marketplace?role=${encodeURIComponent(m.role)}`}
                            className="font-display font-700 text-xs uppercase tracking-wide text-primary hover:opacity-80 transition-opacity"
                          >
                            Find jobs →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Industry Recommendations */}
              {results!.industryFit && results!.industryFit.length > 0 && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Industry Recommendations</h2>
                      <p className="font-body text-xs text-muted-foreground">Sectors where you'd thrive</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results!.industryFit.slice(0, 4).map((ind) => {
                      const slug = INDUSTRY_SLUGS[ind.industry];
                      return (
                        <div key={ind.industry} className="border-2 border-foreground bg-background rounded-2xl p-4 flex flex-col gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-display font-900 text-sm uppercase tracking-wide">{ind.industry}</span>
                              <span className="font-display font-900 text-lg text-blue-500">{ind.confidence}%</span>
                            </div>
                            <p className="font-body text-xs text-muted-foreground line-clamp-2">{ind.reason}</p>
                          </div>
                          <div className="flex gap-2 mt-auto pt-1 border-t border-border">
                            {slug && (
                              <>
                                <Link
                                  to={`/${slug}`}
                                  className="font-display font-700 text-xs uppercase tracking-wide text-foreground hover:text-primary transition-colors"
                                >
                                  Explore industry →
                                </Link>
                                <span className="text-border">·</span>
                              </>
                            )}
                            <Link
                              to={`/marketplace?industry=${encodeURIComponent(ind.industry)}`}
                              className="font-display font-700 text-xs uppercase tracking-wide text-primary hover:opacity-80 transition-opacity"
                            >
                              Browse jobs →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Unexpected Ideas */}
              {results!.roleMatches && results!.roleMatches.length > 6 && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Unexpected Ideas</h2>
                      <p className="font-body text-xs text-muted-foreground">Roles you might not have considered</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results!.roleMatches.slice(6, 9).map((m) => (
                      <Link
                        key={m.slug}
                        to={`/roles/${m.slug}`}
                        className="group border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-2xl p-4 hover:bg-primary hover:border-foreground hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-900 text-sm uppercase tracking-wide">{m.role}</span>
                          <Lightbulb className="w-4 h-4 text-yellow-500 group-hover:text-foreground transition-colors" />
                        </div>
                        <p className="font-body text-xs text-muted-foreground group-hover:text-foreground/80 line-clamp-2">{m.reason}</p>
                      </Link>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Side Hustle Suggestions */}
              <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-900 text-xl uppercase tracking-wide">Side Hustle Ideas</h2>
                    <p className="font-body text-xs text-muted-foreground">Turn your skills into income outside of 9–5</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sidehustles.map((s) => (
                    <Link
                      key={s.title}
                      to={s.link}
                      className="group border-2 border-foreground/20 bg-background rounded-2xl p-4 hover:bg-primary hover:border-foreground hover:-translate-y-0.5 transition-all"
                    >
                      <p className="font-display font-900 text-sm uppercase tracking-wide mb-1">{s.title}</p>
                      <p className="font-body text-xs text-muted-foreground group-hover:text-foreground/80">{s.desc}</p>
                    </Link>
                  ))}
                </div>
                <Link to="/side-hustles" className="inline-flex items-center gap-1.5 mt-3 font-display font-700 text-xs uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                  Explore all side hustles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.section>

              {/* Business Ideas */}
              <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
                <div className="border-2 border-foreground rounded-3xl p-6 md:p-8 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display font-900 text-xl uppercase tracking-wide">Start Something</h2>
                      <p className="font-body text-sm text-muted-foreground mt-1 max-w-md">
                        Got an idea? Think you could build something? We've put together everything you need to start your own business — from idea to first customer.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="rounded-full shrink-0 border-2 border-foreground">
                    <Link to="/starting-a-business">Explore starting a business <ArrowRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                </div>
              </motion.section>

              {/* Skills + profile link */}
              {results!.transferableSkills && results!.transferableSkills.length > 0 && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.5 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="font-display font-900 text-xl uppercase tracking-wide">Your Transferable Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results!.transferableSkills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-full border-2 border-foreground font-display font-700 text-xs uppercase tracking-wide bg-background">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Profile context: RIASEC, passions, dream roles, dream companies */}
              {(profile.hasQuiz || profile.hasInterests || profile.targetCompanies.length > 0) && (
                <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.55 }}>
                  <div className="border-2 border-foreground/10 rounded-3xl p-6 bg-muted/30 space-y-5">
                    <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground">Also factored into your matches</p>

                    {profile.riasecScores && (
                      <div>
                        <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Brain className="w-3 h-3" /> Your personality (RIASEC)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(Object.entries(profile.riasecScores) as [string, number][])
                            .sort((a, b) => b[1] - a[1])
                            .map(([k, v]) => (
                              <div key={k} className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="flex justify-between mb-0.5">
                                    <span className="font-display font-700 text-xs">{RIASEC_LABELS[k]?.label ?? k}</span>
                                    <span className="font-display font-700 text-xs text-primary">{Math.round(v)}</span>
                                  </div>
                                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-3 gap-4">
                      {profile.passions.length > 0 && (
                        <div>
                          <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Heart className="w-3 h-3" /> What you love
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.passions.map((p) => (
                              <span key={p} className="px-2.5 py-1 rounded-full border border-foreground/20 font-display font-700 text-xs bg-background">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.rolePreferences.length > 0 && (
                        <div>
                          <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Target className="w-3 h-3" /> Dream roles
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.rolePreferences.map((r) => (
                              <Link
                                key={r}
                                to={`/marketplace?role=${encodeURIComponent(r)}`}
                                className="px-2.5 py-1 rounded-full border border-primary/40 font-display font-700 text-xs bg-primary/5 text-primary hover:bg-primary hover:text-foreground transition-colors"
                              >
                                {r} →
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.targetCompanies.length > 0 && (
                        <div>
                          <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" /> Dream companies
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.targetCompanies.map((c) => (
                              <Link
                                key={c}
                                to={`/marketplace?company=${encodeURIComponent(c)}`}
                                className="px-2.5 py-1 rounded-full border border-foreground/20 font-display font-700 text-xs bg-background hover:bg-foreground hover:text-background transition-colors"
                              >
                                {c} →
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {!profile.hasQuiz && (
                      <div className="flex items-center gap-3 pt-1 border-t border-border">
                        <Brain className="w-4 h-4 text-primary shrink-0" />
                        <p className="font-body text-xs text-muted-foreground flex-1">
                          Take the personality quiz to make your matches even more accurate — it only takes 2 minutes.
                        </p>
                        <Button asChild size="sm" className="rounded-full shrink-0">
                          <Link to="/onboarding?step=personality">Take the Quiz</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.6 }} className="pt-4 pb-2 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/my-profile">Update my profile <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-foreground">
                  <Link to="/my-jobs">Browse my jobs <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </motion.div>

            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
