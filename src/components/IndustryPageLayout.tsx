import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
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
  // Also inject a Skills passport link at the bottom of every Plan tab.
  const tabsWithMentor = useMemo(() => {
    const withSkills = tabs.map((t) => {
      if (t.id !== "plan") return t;
      return {
        ...t,
        content: (
          <>
            {t.content}
            <div className="mt-10 border-t border-border/60 pt-8">
              <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Skills England
              </p>
              <h3 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-2">
                Know your skills.
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-5 max-w-lg">
                Rate your skills for roles in this industry, see where your gaps are, and get a personalised learning path to close them.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/skills-passport?tab=assessment"
                  className="inline-flex items-center gap-2 px-4 py-2.5 font-display font-700 text-xs bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                >
                  Rate my skills
                </Link>
                <Link
                  to="/skills-passport?tab=gaps"
                  className="inline-flex items-center gap-2 px-4 py-2.5 font-display font-700 text-xs border-2 border-foreground/20 rounded-full hover:border-primary hover:text-primary transition-colors"
                >
                  See my skill gaps
                </Link>
                <Link
                  to="/skills-passport?tab=passport"
                  className="inline-flex items-center gap-2 px-4 py-2.5 font-display font-700 text-xs border-2 border-foreground/20 rounded-full hover:border-primary hover:text-primary transition-colors"
                >
                  Career passport
                </Link>
              </div>
            </div>
          </>
        ),
      };
    });
    if (withSkills.some((t) => t.id === "mentor")) return withSkills;
    return [
      ...withSkills,
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
  const contentRef = useRef<HTMLDivElement>(null);
  const tabBarSentinelRef = useRef<HTMLDivElement>(null);

  // Tapping a tab swaps content that sits below the tab grid - on mobile that
  // grid plus the hero often fills the whole screen, so without an explicit
  // scroll the new content is invisible below the fold and it looks like the
  // tap did nothing. Scroll it into view every time the active tab changes.
  //
  // Tabs whose content loads asynchronously (Attend's EventsSection fetches
  // events after mount) can grow/shift height WHILE the smooth-scroll
  // animation from the first call is still in flight, which cuts the browser's
  // native scroll short - found live: the target heading was still ~500px
  // below the viewport top after the "completed" scroll. A second corrective
  // call once that content has had time to settle fixes the undershoot.
  const selectTab = (id: string) => {
    setActiveTab(id);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 600);
  };

  // Once the tap scrolls you into a tab's content, the full tab grid above
  // scrolls out of view with it - on mobile that leaves no way to get to
  // another tab without scrolling all the way back up (feedback: "lost and
  // can't go back"). A sticky bar mirrors the full grid once it's scrolled
  // past, so any tab is reachable from wherever you are.
  //
  // Watches a 1px SENTINEL placed right after the grid, not the grid itself.
  // The grid is ~350px tall - some tabs (Read, Attend) have short enough
  // content that the page can never scroll far enough for the *entire* grid
  // to leave the viewport, so its bottom row stays permanently peeking into
  // view and isIntersecting never flips to false. A sentinel has ~0 height,
  // so it crosses the viewport edge (and isIntersecting flips) as soon as
  // you've scrolled past that exact point, regardless of the grid's own
  // height or how much scrollable content exists below it.
  //
  // rootMargin's negative top shrinks the effective viewport the observer
  // checks against. Needed because the sentinel sits immediately before
  // contentRef, which the auto-scroll targets - after that scroll settles,
  // the sentinel rests at y=~0.2px, right on the intersecting/not boundary
  // rather than clearly past it. That made the bar not appear until the
  // user nudged the page with a manual scroll (found live 2026-09-15: "only
  // appears if you move the screen"). Requiring 24px of clearance means the
  // scroll's own resting position reliably counts as "past it".
  const [showStickyTabs, setShowStickyTabs] = useState(false);
  useEffect(() => {
    const el = tabBarSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyTabs(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-24px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Shared box renderer for both the primary hero grid and the fixed bars
  // (mobile compact + desktop full) that mirror it once it's scrolled past -
  // `compact` shrinks icon/padding sizing so a permanently-pinned desktop bar
  // doesn't eat too much vertical space, without changing the box styling.
  const renderTabBox = (tab: IndustryTab, compact: boolean) => {
    const icon = TAB_ICONS[tab.id];
    const isActive = activeTab === tab.id;
    const isApply = tab.id === "apply";
    const isMentor = tab.id === "mentor";
    const iconSize = compact ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12";
    const iconPx = compact ? 32 : 48;
    return (
      <button
        key={tab.id}
        onClick={() => selectTab(tab.id)}
        aria-current={isActive}
        className={`flex flex-col items-center gap-2 px-3 ${compact ? "py-2" : "py-4"} transition-all border-2 ${
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
            className={`${iconSize} object-contain transition-opacity ${
              isActive ? "opacity-100" : isApply ? "opacity-80" : "opacity-60"
            }`}
            loading="lazy"
            width={iconPx}
            height={iconPx}
          />
        ) : isMentor ? (
          <HeartHandshake
            className={`${iconSize} transition-opacity ${isActive ? "opacity-100 text-primary" : "opacity-60"}`}
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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky tab bars - mirror the full grid once it's scrolled out of
          view so every tab stays reachable without scrolling back up
          (mobile: compact icon strip; desktop: the same boxes, just
          slightly condensed since this one stays pinned permanently).
          Deliberately `fixed`, not `sticky`: a `sticky` element still
          occupies space in normal flow, so mounting/unmounting it on scroll
          shifted the full grid below it, which flipped the IntersectionObserver
          verdict back, causing a mount/unmount feedback loop that read as
          juddering. `fixed` sits outside document flow entirely, so
          showing/hiding it can never move anything else. */}
      {showStickyTabs && (
        <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-background border-b-2 border-foreground/10 shadow-sm">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 px-2 py-2">
            {sortedTabs.map((tab) => {
              const icon = TAB_ICONS[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  aria-label={tab.label}
                  aria-current={isActive}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 shrink-0 rounded-lg transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground/70"
                  }`}
                >
                  {icon ? (
                    <img src={icon} alt="" className="w-6 h-6 object-contain" loading="lazy" width={24} height={24} />
                  ) : (
                    <HeartHandshake className="w-6 h-6" strokeWidth={1.5} />
                  )}
                  <span className="font-display font-700 text-[10px] tracking-wide uppercase whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {showStickyTabs && (
        <div className="hidden md:block fixed top-0 inset-x-0 z-40 bg-background border-b-2 border-foreground/10 shadow-sm">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-9 gap-3 py-3">
              {sortedTabs.map((tab) => renderTabBox(tab, true))}
            </div>
          </div>
        </div>
      )}
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
            {sortedTabs.map((tab) => renderTabBox(tab, false))}
          </div>
          {/* Sentinel the sticky-bar observer watches - see note above. */}
          <div ref={tabBarSentinelRef} />
        </motion.div>

        {/* Active tab content. Padded down when a sticky bar is showing so
            it doesn't sit under it (the bar is `fixed`, so it overlays
            rather than pushing content down) - values match each bar's
            measured height with a little headroom. */}
        <motion.div
          ref={contentRef}
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={showStickyTabs ? "pt-20 md:pt-28" : ""}
        >
          {activeContent}
        </motion.div>
      </div>
    </div>
  );
};

export default IndustryPageLayout;
