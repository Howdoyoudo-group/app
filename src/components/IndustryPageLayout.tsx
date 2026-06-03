import { useState, useMemo, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { useTrackPageView } from "@/hooks/useTrackInteraction";
import SEO, { industryDesc, breadcrumbJsonLd } from "@/components/SEO";
import CollapsibleReadSections from "./CollapsibleReadSections";
import ReorderListenSections from "./ReorderListenSections";
import MentoringPanel from "./MentoringPanel";
import { INDUSTRY_ICONS } from "@/data/industryIcons";

import tabListen from "@/assets/tab-listen.png";
import tabRead from "@/assets/tab-read.png";
import tabWatch from "@/assets/tab-watch.png";
import tabWho from "@/assets/tab-who.png";
import tabAttend from "@/assets/tab-attend.png";
import tabLearn from "@/assets/tab-learn.png";
import tabApply from "@/assets/tab-apply.png";
import tabPlan from "@/assets/tab-work.png";

const TAB_ICONS: Record<string, string> = {
  listen: tabListen,
  read: tabRead,
  watch: tabWatch,
  work: tabWho,
  attend: tabAttend,
  learn: tabLearn,
  apply: tabApply,
  plan: tabPlan,
};

const TAB_ORDER = ["plan", "watch", "listen", "read", "work", "attend", "learn", "mentor", "apply"];

export interface IndustryTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface IndustryPageLayoutProps {
  name: string;
  description: string;
  profile?: string;
  tabs: IndustryTab[];
  /** Optional override for the slug used in interaction tracking. Defaults to a kebab-case of `name`. */
  industrySlug?: string;
}

const IndustryPageLayout = ({
  name,
  description,
  profile,
  tabs,
  industrySlug,
}: IndustryPageLayoutProps) => {
  // Slug used for analytics + employer dashboard (matches employer_companies.industry values).
  const trackingSlug = useMemo(() => {
    if (industrySlug) return industrySlug;
    return name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [industrySlug, name]);

  useTrackPageView({ type: "industry_view", industry: trackingSlug });

  // Auto-inject a Mentor tab on every industry so members can find/offer mentoring.
  const tabsWithMentor = useMemo(() => {
    if (tabs.some((t) => t.id === "mentor")) return tabs;
    return [
      ...tabs,
      {
        id: "mentor",
        label: "Mentor",
        content: <MentoringPanel industrySlug={trackingSlug} industryName={name} />,
      },
    ];
  }, [tabs, trackingSlug, name]);

  const sortedTabs = [...tabsWithMentor].sort((a, b) => {
    const ai = TAB_ORDER.indexOf(a.id);
    const bi = TAB_ORDER.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  const [activeTab, setActiveTab] = useState(sortedTabs[0]?.id || "");
  const location = useLocation();

  // Sync active tab with URL hash (e.g. /fashion#watch)
  useEffect(() => {
    const hash = (location.hash || window.location.hash).replace("#", "").toLowerCase();
    if (hash && sortedTabs.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }
    const applyHash = () => {
      const h = window.location.hash.replace("#", "").toLowerCase();
      if (h && sortedTabs.some((t) => t.id === h)) setActiveTab(h);
    };
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, location.pathname]);

  const activeTabObj = sortedTabs.find((t) => t.id === activeTab);
  const rawContent = activeTabObj?.content;
  // Auto-wrap the Read tab in collapsible sections, and reorder the Listen tab
  // so curated "Podcasts We Rate" sits above the AI-narrated player.
  const activeContent = activeTabObj?.id === "read"
    ? <CollapsibleReadSections>{rawContent}</CollapsibleReadSections>
    : activeTabObj?.id === "listen"
      ? <ReorderListenSections>{rawContent}</ReorderListenSections>
      : rawContent;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${name} Industry - Jobs, Courses & Culture`}
        description={industryDesc(name)}
        path={`/${trackingSlug}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name, path: `/${trackingSlug}` },
        ])}
      />
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* spacer */}

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {INDUSTRY_ICONS[name] && (
            <img
              src={INDUSTRY_ICONS[name]}
              alt=""
              aria-hidden="true"
              className="hidden md:block absolute -top-12 lg:-top-16 right-0 w-56 lg:w-72 xl:w-80 h-auto object-contain opacity-20 pointer-events-none select-none -z-0"
              loading="lazy"
            />
          )}
          <div className="relative z-10">
          <p className="text-foreground text-xs tracking-[0.3em] uppercase font-body mb-3">
            How do you do<span className="text-primary">?</span>
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-4">
            {name}
            <span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-xl mb-4">
            {description}
          </p>
          {profile && (
            <p className="text-muted-foreground font-body text-sm max-w-2xl mb-6 leading-relaxed">
              {profile}
            </p>
          )}
          </div>

          {/* Tab bar */}
          <div className="grid grid-cols-3 md:grid-cols-9 gap-3 mb-12 border-b border-border pb-6">
            {sortedTabs.map((tab) => {
              const icon = TAB_ICONS[tab.id];
              const isActive = activeTab === tab.id;
              const isApply = tab.id === "apply";
              const isMentor = tab.id === "mentor";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-2 px-3 py-4 transition-all border-2 ${
                    isApply
                      ? isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary bg-primary/10 hover:bg-primary/20"
                      : isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                  }`}
                >
                  {icon ? (
                    <img
                      src={icon}
                      alt={tab.label}
                      className={`w-10 h-10 md:w-12 md:h-12 object-contain transition-opacity ${
                        isActive ? "opacity-100" : isApply ? "opacity-80" : "opacity-60"
                      }`}
                      loading="lazy"
                      width={48}
                      height={48}
                    />
                  ) : isMentor ? (
                    <HeartHandshake
                      className={`w-10 h-10 md:w-12 md:h-12 transition-opacity ${
                        isActive ? "opacity-100 text-primary" : "opacity-60"
                      }`}
                      strokeWidth={1.5}
                    />
                  ) : null}
                  <span
                    className={`font-display font-700 text-xs tracking-wide uppercase transition-colors ${
                      isApply
                        ? isActive ? "text-primary-foreground" : "text-primary"
                        : isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Active tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IndustryPageLayout;
