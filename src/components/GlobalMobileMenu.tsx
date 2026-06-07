import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type NavItem = {
  label: string;
  to?: string;
  href?: string;
  description?: string;
  badge?: string;
  divider?: boolean;
};

type NavSubSection = {
  label: string;
  items: NavItem[];
};

type NavSection = {
  label: string;
  items?: NavItem[];          // flat list (most sections)
  subSections?: NavSubSection[]; // grouped drill-down (Level Up)
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Inspire",
    items: [
      { label: "The Show", to: "/the-show", description: "Our original series" },
      { label: "Videos", to: "/videos", description: "Watch the best career stories" },
      { label: "Articles", to: "/feed", description: "Read & learn", badge: "Coming Soon" },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Yourself", to: "/my-profile", description: "Interests, personality, strengths & values" },
      { label: "Industries", href: "/#series", description: "Explore 30+ sectors" },
      { label: "Roles", to: "/roles", description: "By job, not just by title" },
      { label: "Side Hustles", to: "/side-hustles", description: "Turn what you love into income" },
      { label: "Start a Business", to: "/starting-a-business", description: "Your own thing" },
      { label: "Match Me", to: "/match-me", description: "See where you could go", badge: "New" },
    ],
  },
  {
    label: "Level Up",
    subSections: [
      {
        label: "Skills",
        items: [
          { label: "Football Learning Module", to: "/football/badge", description: "Lessons & badge — earn it for your profile", badge: "New" },
          { label: "Skills Assessment", to: "/skills-passport", description: "Find out what you're good at", badge: "Coming Soon" },
          { label: "Skill Gaps", to: "/skills-passport", description: "See what you need to learn", badge: "Coming Soon" },
          { label: "Skills Passport", to: "/skills-passport", description: "Track and show your skills", badge: "Coming Soon" },
        ],
      },
      {
        label: "Learning Hub",
        items: [
          { label: "Further Education", to: "/resources/education", description: "University, college & courses" },
          { label: "Online Learning", to: "/resources/online-courses", description: "Learn at your own pace" },
          { label: "Mentoring", to: "/resources/mentoring", description: "Find a mentor to guide you" },
          { label: "Interview Skills", to: "/resources/interview-skills", description: "Prep and practice" },
          { label: "Employability", to: "/resources/employability", description: "Confidence & communication" },
          { label: "Financial Skills", to: "/resources/money", description: "Money, budgeting & tax" },
          { label: "Resilience & Confidence", to: "/resources/resilience-confidence", description: "Bounce back and back yourself" },
        ],
      },
      {
        label: "Experience",
        items: [
          { label: "Practice Interviews", to: "/learning", description: "AI mock interviews with Howdy", badge: "Coming Soon" },
          { label: "Internships & Grad Schemes", to: "/resources/internships-graduates", description: "Structured programmes" },
          { label: "Work Experience", to: "/resources/work-experience", description: "Get your foot in the door" },
          { label: "Apprenticeships", to: "/resources/apprenticeships", description: "Earn while you learn" },
          { label: "Volunteering", to: "/resources/volunteering", description: "Build skills and make a difference" },
          { label: "How to Stand Out", to: "/how-to-stand-out", description: "Side hustles, projects, leadership & skills" },
        ],
      },
      {
        label: "Support",
        items: [
          { label: "Social Mobility", to: "/resources/social-mobility", description: "Programmes and support" },
          { label: "Careers Advice", to: "/resources/careers", description: "Guidance and next steps" },
        ],
      },
    ],
  },
  {
    label: "Jobs",
    items: [
      { label: "Jobs Marketplace", to: "/marketplace", description: "Browse all live roles" },
      { label: "Howdy Jobs", to: "/my-jobs?tab=jobs", description: "Roles matched to your profile" },
      { label: "CV Builder", to: "/cv-builder", description: "Build a profile that stands out" },
      { label: "Help Me Apply", to: "/help-me-apply", description: "AI cover letters & applications", badge: "New" },
      { label: "Interview Prep", to: "/resources/interview-skills", description: "Practice and prepare" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Feed", to: "/feed", description: "Industry news, videos & briefings" },
      { label: "People", to: "/community", description: "Members, chat & connections" },
      { label: "Events", to: "/events", description: "What's on in your industry" },
      { label: "Mentors", to: "/mentoring", description: "Learn from people already doing it" },
      { label: "Help", divider: true },
      { label: "The Mix", href: "https://www.themix.org.uk", description: "Free support for under 25s" },
      { label: "Shout", href: "https://www.giveusashout.org", description: "24/7 crisis text line" },
      { label: "National Careers Service", href: "https://nationalcareers.service.gov.uk", description: "Free careers guidance" },
    ],
  },
];

const PROFILE_ITEMS: NavItem[] = [
  { label: "Edit Profile", to: "/my-profile" },
  { label: "Take the Quiz", to: "/onboarding" },
  { label: "Privacy & Account", to: "/terms" },
];

type Props = {
  showAvatar?: boolean;
  panelTopClass?: string;
};

const GlobalMobileMenu = ({ showAvatar = true, panelTopClass = "top-16" }: Props) => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openSubSection, setOpenSubSection] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const location = useLocation();

  const closeMenu = () => {
    setOpen(false);
    setOpenSection(null);
    setOpenSubSection(null);
  };

  // Close on navigation
  useEffect(() => { closeMenu(); }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    let active = true;
    if (!user) { setPhotoUrl(null); return; }
    (async () => {
      const meta = (user.user_metadata as any) || {};
      const metadataPhoto = meta.avatar_url || meta.picture || null;
      const { data } = await supabase
        .from("profiles")
        .select("photo_url")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setPhotoUrl((data as any)?.photo_url || metadataPhoto || null);
    })();
    return () => { active = false; };
  }, [user]);

  const allSections: NavSection[] = user
    ? [...NAV_SECTIONS, { label: "Profile", items: PROFILE_ITEMS }]
    : NAV_SECTIONS;

  const activeSection = allSections.find((s) => s.label === openSection);
  const activeSubSection = activeSection?.subSections?.find((ss) => ss.label === openSubSection);

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        {showAvatar && user && (
          <Link
            to="/my-profile"
            aria-label="Profile"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-foreground bg-background shadow-[2px_2px_0_hsl(var(--foreground))] hover:opacity-90 transition-opacity"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 font-display font-900 text-foreground text-sm">
                {(user.email?.[0] || "?").toUpperCase()}
              </div>
            )}
          </Link>
        )}

        <button
          type="button"
          onClick={() => { setOpen((v) => !v); setOpenSection(null); setOpenSubSection(null); }}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground bg-background text-foreground hover:bg-primary transition-colors"
        >
          {open ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onPointerDown={closeMenu}
              className="md:hidden fixed inset-0 z-40 bg-foreground/10"
              aria-hidden
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`md:hidden fixed ${panelTopClass} inset-x-4 z-50 bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] overflow-y-auto max-h-[calc(100dvh-5rem)]`}
            >
              <AnimatePresence mode="wait">

                {/* LEVEL 1 — section list */}
                {!openSection && (
                  <motion.div
                    key="top"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 flex flex-col gap-1"
                  >
                    <Link
                      to="/"
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-3 py-2 mb-1 rounded-xl font-display font-700 text-xs uppercase tracking-widest text-foreground/50 hover:text-foreground hover:bg-primary/40 transition-colors"
                    >
                      <ArrowLeft size={13} strokeWidth={2.5} />
                      Home
                    </Link>
                    <div className="h-px bg-foreground/15 mb-2" />

                    {allSections.map((section) => (
                      <button
                        key={section.label}
                        type="button"
                        onClick={() => { setOpenSection(section.label); setOpenSubSection(null); }}
                        className="flex items-center justify-between w-full px-3 py-3 rounded-xl font-display font-900 text-lg uppercase tracking-wide text-foreground hover:bg-primary transition-colors text-left"
                      >
                        {section.label}
                        <ChevronRight size={18} strokeWidth={2.5} className="text-foreground/40" />
                      </button>
                    ))}

                    <div className="h-px bg-foreground/15 my-1" />

                    {user ? (
                      <button
                        type="button"
                        onClick={async () => { closeMenu(); await signOut(); }}
                        className="px-3 py-3 font-display font-900 text-lg uppercase tracking-wide text-foreground/50 hover:text-foreground text-left transition-colors"
                      >
                        Sign Out
                      </button>
                    ) : authLoading ? null : (
                      <Link
                        to="/auth"
                        onClick={closeMenu}
                        className="px-3 py-3 font-display font-900 text-xl uppercase tracking-wide text-primary hover:opacity-80 transition-opacity"
                      >
                        Sign In
                      </Link>
                    )}
                  </motion.div>
                )}

                {/* LEVEL 2 — flat items list (most sections) */}
                {openSection && activeSection && activeSection.items && !openSubSection && (
                  <motion.div
                    key={`section-${openSection}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenSection(null)}
                      className="flex items-center gap-2 mb-3 font-display font-700 text-xs uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      Back
                    </button>

                    <div className="font-display font-900 text-xs uppercase tracking-[0.2em] text-primary mb-2 px-1">
                      {activeSection.label}
                    </div>

                    {activeSection.items.map((item) => {
                      if (item.divider) {
                        return (
                          <div key={item.label} className="flex items-center gap-2 px-3 pt-3 pb-1">
                            <div className="h-px flex-1 bg-foreground/15" />
                            <span className="font-display font-700 text-[9px] uppercase tracking-[0.18em] text-foreground/40">{item.label}</span>
                            <div className="h-px flex-1 bg-foreground/15" />
                          </div>
                        );
                      }
                      const isComingSoon = item.badge === "Coming Soon";
                      const inner = (
                        <>
                          <span className="font-display font-900 text-base uppercase tracking-wide text-foreground flex items-center gap-2">
                            {item.label}
                            {item.badge && (
                              <span className={`font-display font-700 text-[9px] uppercase tracking-wide px-1.5 py-0.5 border rounded-full leading-none ${isComingSoon ? "bg-foreground/10 text-foreground/50 border-foreground/20" : "bg-primary text-foreground border-foreground"}`}>
                                {item.badge}
                              </span>
                            )}
                          </span>
                          {item.description && (
                            <span className="font-body text-xs text-foreground/50 mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </>
                      );
                      if (isComingSoon) {
                        return (
                          <div key={item.label} className="flex flex-col px-3 py-3 rounded-xl opacity-50 cursor-not-allowed">
                            {inner}
                          </div>
                        );
                      }
                      return item.to ? (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={closeMenu}
                          className="flex flex-col px-3 py-3 rounded-xl hover:bg-primary transition-colors border-2 border-transparent hover:border-foreground"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <a
                          key={item.label}
                          href={item.href}
                          target={item.href?.startsWith("http") ? "_blank" : undefined}
                          rel={item.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                          onClick={closeMenu}
                          className="flex flex-col px-3 py-3 rounded-xl hover:bg-primary transition-colors border-2 border-transparent hover:border-foreground"
                        >
                          {inner}
                        </a>
                      );
                    })}
                  </motion.div>
                )}

                {/* LEVEL 2 — sub-section group list (Level Up) */}
                {openSection && activeSection && activeSection.subSections && !openSubSection && (
                  <motion.div
                    key={`section-${openSection}-groups`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenSection(null)}
                      className="flex items-center gap-2 mb-3 font-display font-700 text-xs uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      Back
                    </button>

                    <div className="font-display font-900 text-xs uppercase tracking-[0.2em] text-primary mb-2 px-1">
                      {activeSection.label}
                    </div>

                    {activeSection.subSections.map((sub) => (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => setOpenSubSection(sub.label)}
                        className="flex items-center justify-between w-full px-3 py-3 rounded-xl font-display font-900 text-base uppercase tracking-wide text-foreground hover:bg-primary transition-colors text-left border-2 border-transparent hover:border-foreground"
                      >
                        <span>
                          {sub.label}
                          <span className="block font-body font-400 text-xs text-foreground/50 normal-case tracking-normal mt-0.5">
                            {sub.items.length} topics
                          </span>
                        </span>
                        <ChevronRight size={18} strokeWidth={2.5} className="text-foreground/40 shrink-0" />
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* LEVEL 3 — sub-section items */}
                {openSection && activeSection && activeSection.subSections && openSubSection && activeSubSection && (
                  <motion.div
                    key={`subsection-${openSubSection}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenSubSection(null)}
                      className="flex items-center gap-2 mb-3 font-display font-700 text-xs uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      {activeSection.label}
                    </button>

                    <div className="font-display font-900 text-xs uppercase tracking-[0.2em] text-primary mb-2 px-1">
                      {activeSubSection.label}
                    </div>

                    {activeSubSection.items.map((item) => {
                      const isComingSoon = item.badge === "Coming Soon";
                      const inner = (
                        <>
                          <span className="font-display font-900 text-base uppercase tracking-wide text-foreground flex items-center gap-2">
                            {item.label}
                            {item.badge && (
                              <span className={`font-display font-700 text-[9px] uppercase tracking-wide px-1.5 py-0.5 border rounded-full leading-none ${isComingSoon ? "bg-foreground/10 text-foreground/50 border-foreground/20" : "bg-primary text-foreground border-foreground"}`}>
                                {item.badge}
                              </span>
                            )}
                          </span>
                          {item.description && (
                            <span className="font-body text-xs text-foreground/50 mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </>
                      );
                      if (isComingSoon) {
                        return (
                          <div key={item.label} className="flex flex-col px-3 py-3 rounded-xl opacity-50 cursor-not-allowed">
                            {inner}
                          </div>
                        );
                      }
                      return item.to ? (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={closeMenu}
                          className="flex flex-col px-3 py-3 rounded-xl hover:bg-primary transition-colors border-2 border-transparent hover:border-foreground"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <a
                          key={item.label}
                          href={item.href}
                          target={item.href?.startsWith("http") ? "_blank" : undefined}
                          rel={item.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                          onClick={closeMenu}
                          className="flex flex-col px-3 py-3 rounded-xl hover:bg-primary transition-colors border-2 border-transparent hover:border-foreground"
                        >
                          {inner}
                        </a>
                      );
                    })}
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalMobileMenu;
