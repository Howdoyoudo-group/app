import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Trophy, Lock, ArrowRight, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import footballBadgeImg from "@/assets/series-football.jpg";
import SkillsAssessmentTab from "@/pages/skills/SkillsAssessmentTab";
import SkillGapsTab from "@/pages/skills/SkillGapsTab";
import CareerPassportTab from "@/pages/skills/CareerPassportTab";

const MODULES = [
  {
    slug: "football",
    title: "Football",
    description: "4 lessons covering how the industry works, where the money is, and what the jobs actually look like. Pass the quiz and earn your badge.",
    href: "/football/badge",
    image: footballBadgeImg,
    available: true,
    badge: "New",
  },
  { slug: "music",        title: "Music",        description: "From streaming economics to live events — how the music industry really works and how to build a career in it.", href: null, image: null, available: false },
  { slug: "fashion",      title: "Fashion",      description: "Design, buying, marketing and more — the full picture of how fashion employs people you'd never expect.", href: null, image: null, available: false },
  { slug: "technology",   title: "Technology",   description: "Understand the tech industry from product to engineering to go-to-market — and where you fit in.", href: null, image: null, available: false },
  { slug: "hospitality",  title: "Hospitality",  description: "Operations, events, front of house and beyond — a real look at careers in hospitality.", href: null, image: null, available: false },
  { slug: "beauty",       title: "Beauty",       description: "Brand, retail, education and media — the many ways to build a career in the beauty industry.", href: null, image: null, available: false },
];

const TABS = [
  { key: "badges",     label: "Badges" },
  { key: "assessment", label: "Skills Assessment" },
  { key: "gaps",       label: "Skill Gaps" },
  { key: "passport",   label: "Skills Passport" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SkillsPassport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") ?? "badges") as TabKey;

  const setTab = (key: TabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", key);
      // Preserve role param if switching between skills tabs
      if (key === "badges") next.delete("role");
      return next;
    });
  };

  return (
    <>
      <SEO
        title="Skills Passport | Howdoyoudo?"
        description="Learn an industry, rate your skills, see your gaps, and find courses to close them."
      />

      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-foreground/20 bg-background mb-4">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">Skills Passport</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl leading-[1.05] tracking-tight text-foreground mb-3">
              Know your skills.<br className="hidden sm:block" /> Show your progress.
            </h1>
            <p className="font-body text-base text-muted-foreground max-w-2xl">
              Earn industry badges, rate your skills against real roles, see your gaps, and follow a personalised learning path.
            </p>
          </motion.div>

          {/* Tab bar */}
          <div className="border-b border-border mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={`px-4 py-2.5 font-display font-700 text-sm whitespace-nowrap border-b-2 transition-colors -mb-px ${
                    activeTab === tab.key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "badges" && <BadgesTab />}
            {activeTab === "assessment" && <SkillsAssessmentTab />}
            {activeTab === "gaps" && <SkillGapsTab />}
            {activeTab === "passport" && <CareerPassportTab />}
          </motion.div>

        </section>
      </main>
      <Footer />
    </>
  );
}

// ── Badges tab (existing content) ────────────────────────────────────────────
function BadgesTab() {
  return (
    <>
      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { step: "1", label: "Pick a module", desc: "Choose an industry you're interested in." },
          { step: "2", label: "Complete the lessons", desc: "4 short lessons. Read at your own pace." },
          { step: "3", label: "Pass the quiz", desc: "Score 80%+ and your badge is added to your profile." },
        ].map((s) => (
          <div key={s.step} className="border-2 border-foreground/20 rounded-2xl p-4 flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shrink-0 font-display font-900 text-xs">
              {s.step}
            </div>
            <div>
              <p className="font-display font-900 text-sm uppercase tracking-wide mb-0.5">{s.label}</p>
              <p className="font-body text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modules grid */}
      <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-5">Modules</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod) => {
          if (mod.available && mod.href) {
            return (
              <Link
                key={mod.slug}
                to={mod.href}
                className="group border-2 border-foreground rounded-2xl overflow-hidden hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-shadow"
              >
                <div className="aspect-video bg-foreground/5 overflow-hidden">
                  {mod.image ? (
                    <img src={mod.image} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display font-900 text-base uppercase tracking-wide">{mod.title}</p>
                    {mod.badge && (
                      <span className="font-display font-700 text-[9px] uppercase tracking-wide px-1.5 py-0.5 border border-foreground bg-primary rounded-full leading-none">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3">{mod.description}</p>
                  <span className="inline-flex items-center gap-1 font-display font-700 text-xs uppercase tracking-widest text-primary group-hover:opacity-80 transition-opacity">
                    Start module <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          }
          return (
            <div key={mod.slug} className="border-2 border-foreground/15 rounded-2xl overflow-hidden opacity-60">
              <div className="aspect-video bg-foreground/5 flex items-center justify-center">
                <Lock className="w-6 h-6 text-foreground/20" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-display font-900 text-base uppercase tracking-wide">{mod.title}</p>
                  <span className="font-display font-700 text-[9px] uppercase tracking-wide px-1.5 py-0.5 border border-foreground/20 bg-foreground/10 rounded-full leading-none text-foreground/50">
                    Coming Soon
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
