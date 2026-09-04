import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Trophy, Star, TrendingUp, ClipboardList, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";
import HowdyIntro from "@/components/HowdyIntro";
import SkillsAssessmentTab from "@/pages/skills/SkillsAssessmentTab";
import SkillGapsTab from "@/pages/skills/SkillGapsTab";
import PlanTab from "@/pages/skills/PlanTab";
import BadgesTab from "@/pages/skills/BadgesTab";

type TabKey = "plan" | "badges" | "assessment" | "gaps";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

// Order follows the logic Howdy coaches in: rate yourself, see the gaps,
// get a plan to close them, then earn the badges that prove it.
const TILES: Array<{ title: string; tab: TabKey; Icon: React.ElementType }> = [
  { title: "Skills Assessment", tab: "assessment", Icon: Star },
  { title: "Skill Gaps",        tab: "gaps",       Icon: TrendingUp },
  { title: "Your Plan",         tab: "plan",        Icon: ClipboardList },
  { title: "Industry Badges",   tab: "badges",      Icon: Trophy },
];

export default function SkillsPassport() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") as TabKey | null;

  return (
    <>
      <SEO
        title="Skills Passport | Howdoyoudo?"
        description="Learn an industry, rate your skills, see your gaps, and find courses to close them."
      />

      <SiteNav />
      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">

          {activeTab && (
            <Link
              to="/skills-passport"
              className="inline-flex items-center gap-1.5 font-display font-700 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Skills Passport
            </Link>
          )}

          {/* Hero */}
          <motion.div {...fadeUp} className="mb-8">
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

          <motion.div {...fadeUp} className="mb-8">
            <HowdyIntro>
              This is your skills hub. Rate yourself honestly, see exactly where the gaps are, build your plan to close them, and earn free industry badges along the way.
            </HowdyIntro>
          </motion.div>

          {!activeTab ? (
            <motion.div {...fadeUp}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {TILES.map((tile) => (
                  <Link
                    key={tile.tab}
                    to={`/skills-passport?tab=${tile.tab}`}
                    className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
                  >
                    <tile.Icon className="w-14 h-14 md:w-16 md:h-16 text-foreground" strokeWidth={1.25} />
                    <span className="font-display font-700 text-[11px] md:text-xs leading-tight tracking-tight text-foreground">
                      {tile.title}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "plan" && <PlanTab />}
              {activeTab === "badges" && <BadgesTab />}
              {activeTab === "assessment" && <SkillsAssessmentTab />}
              {activeTab === "gaps" && <SkillGapsTab />}
            </motion.div>
          )}

        </section>
      </main>
      <Footer />
    </>
  );
}
