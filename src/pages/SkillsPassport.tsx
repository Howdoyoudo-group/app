import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Trophy } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";
import HowdyIntro from "@/components/HowdyIntro";
import SkillsAssessmentTab from "@/pages/skills/SkillsAssessmentTab";
import SkillGapsTab from "@/pages/skills/SkillGapsTab";
import PlanTab from "@/pages/skills/PlanTab";
import BadgesTab from "@/pages/skills/BadgesTab";

type TabKey = "plan" | "badges" | "assessment" | "gaps";

export default function SkillsPassport() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") ?? "plan") as TabKey;

  return (
    <>
      <SEO
        title="Skills Passport | Howdoyoudo?"
        description="Learn an industry, rate your skills, see your gaps, and find courses to close them."
      />

      <SiteNav />
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8"
          >
            <HowdyIntro>
              This is your skills hub. Build your plan for a target role, rate yourself honestly, see exactly where the gaps are, and earn free industry badges to close them.
            </HowdyIntro>
          </motion.div>

          {/* Tab content */}
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

        </section>
      </main>
      <Footer />
    </>
  );
}
