import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GlobalMobileMenu from "./GlobalMobileMenu";

const LIME = "hsl(120, 100%, 45%)";

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                                */
/* -------------------------------------------------------------------------- */

const SketchCta = ({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) => (
  <span className="relative inline-flex items-center">
    <svg
      viewBox="0 0 160 52"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <path
        d="M26,3 C14,3 4,14 3,26 C3,38 13,49 26,49 L134,49 C147,49 157,38 157,26 C158,14 147,3 134,3 Z"
        fill={variant === "primary" ? LIME : "transparent"}
        stroke="hsl(0, 0%, 7%)"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span className="relative font-display font-900 text-sm tracking-wide uppercase px-6 py-3 whitespace-nowrap text-foreground">
      {children}
    </span>
  </span>
);

const Underline = () => (
  <svg
    className="absolute -bottom-1.5 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
    viewBox="0 0 80 6"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M1 3 Q20 0 40 3 T79 3"
      stroke={LIME}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Grouped dropdown                                                           */
/* -------------------------------------------------------------------------- */

type DropdownItem = {
  label: string;
  to?: string;
  href?: string;
  description?: string;
  badge?: string;
  divider?: boolean; // renders a labelled separator
};

const NavDropdown = ({
  label,
  items,
  wide = false,
}: {
  label: string;
  items: DropdownItem[];
  wide?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group relative inline-flex items-center gap-1 font-display font-900 text-sm lg:text-base uppercase tracking-wide text-foreground hover:text-primary transition-colors whitespace-nowrap"
      >
        <span className="relative">
          {label}
          <Underline />
        </span>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute left-0 top-full mt-3 z-50 ${wide ? "w-80" : "w-72"} bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] p-2 max-h-[80vh] overflow-y-auto`}
          >
            {items.map((item) => {
              if (item.divider) {
                return (
                  <div key={item.label} className="flex items-center gap-2 px-3 pt-2 pb-1">
                    <div className="h-px flex-1 bg-foreground/15" />
                    <span className="font-display font-700 text-[9px] uppercase tracking-[0.18em] text-foreground/40">{item.label}</span>
                    <div className="h-px flex-1 bg-foreground/15" />
                  </div>
                );
              }
              const isComingSoon = item.badge === "Coming Soon";
              const inner = (
                <div className={`px-3 py-2.5 rounded-xl border-2 border-transparent ${isComingSoon ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:border-foreground transition-colors"}`}>
                  <div className="font-display font-900 text-sm uppercase tracking-wide text-foreground flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="font-display font-700 text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-foreground/10 text-foreground/60 border border-foreground/20 rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <div className="font-body text-xs text-foreground/60 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              );
              if (isComingSoon) {
                return <div key={item.label} role="menuitem" aria-disabled="true">{inner}</div>;
              }
              return item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  {inner}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href?.startsWith("http") ? "_blank" : undefined}
                  rel={item.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  {inner}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Grouped (accordion) dropdown — used for Level Up                          */
/* -------------------------------------------------------------------------- */

type NavGroup = {
  label: string;
  items: DropdownItem[];
};

const GroupedNavDropdown = ({
  label,
  groups,
}: {
  label: string;
  groups: NavGroup[];
}) => {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedGroup(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setExpandedGroup(null); }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const closeAll = () => { setOpen(false); setExpandedGroup(null); };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setExpandedGroup(null); }}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group relative inline-flex items-center gap-1 font-display font-900 text-sm lg:text-base uppercase tracking-wide text-foreground hover:text-primary transition-colors whitespace-nowrap"
      >
        <span className="relative">
          {label}
          <Underline />
        </span>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full mt-3 z-50 w-72 bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] p-2"
          >
            {groups.map((group) => {
              const isExpanded = expandedGroup === group.label;
              return (
                <div key={group.label}>
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary transition-colors border-2 border-transparent hover:border-foreground"
                  >
                    <span className="font-display font-900 text-sm uppercase tracking-wide text-foreground">
                      {group.label}
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={3}
                      className={`text-foreground/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Expanded items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-3 pr-1 pb-1 pt-0.5 space-y-0.5">
                          {group.items.map((item) => {
                            const isComingSoon = item.badge === "Coming Soon";
                            const inner = (
                              <div className={`px-3 py-2 rounded-lg border-2 border-transparent ${isComingSoon ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:border-foreground transition-colors"}`}>
                                <div className="font-display font-900 text-xs uppercase tracking-wide text-foreground flex items-center gap-2">
                                  {item.label}
                                  {item.badge && (
                                    <span className={`font-display font-700 text-[9px] uppercase tracking-wide px-1.5 py-0.5 border rounded-full leading-none ${isComingSoon ? "bg-foreground/10 text-foreground/50 border-foreground/20" : "bg-primary text-foreground border-foreground"}`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <div className="font-body text-xs text-foreground/60 mt-0.5">{item.description}</div>
                                )}
                              </div>
                            );
                            if (isComingSoon) return <div key={item.label} aria-disabled="true">{inner}</div>;
                            return item.to ? (
                              <Link key={item.label} to={item.to} onClick={closeAll} className="block">{inner}</Link>
                            ) : (
                              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" onClick={closeAll} className="block">{inner}</a>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Groups                                                                     */
/* -------------------------------------------------------------------------- */

const INSPIRE: DropdownItem[] = [
  { label: "The Show", to: "/the-show", description: "Our original series" },
  { label: "Videos", to: "/videos", description: "Watch the best career stories" },
  { label: "Articles", to: "/articles", description: "Read & learn" },
];

const DISCOVER: DropdownItem[] = [
  { label: "Yourself", to: "/my-profile", description: "Interests, personality, strengths & values" },
  { label: "Industries", href: "/#series", description: "Explore 30+ sectors" },
  { label: "Roles", to: "/roles", description: "By job, not just by title" },
  { label: "Side Hustles", to: "/side-hustles", description: "Turn what you love into income" },
  { label: "Start a Business", to: "/starting-a-business", description: "Your own thing" },
  { label: "Match Me", to: "/match-me", description: "See where you could go", badge: "New" },
];

const LEVEL_UP_GROUPS: NavGroup[] = [
  {
    label: "Skills",
    items: [
      { label: "Skills Passport", to: "/skills-passport", description: "Industry modules, badges & more" },
      { label: "Skills Assessment", to: "/skills-passport", description: "Find out what you're good at", badge: "Coming Soon" },
      { label: "Skill Gaps", to: "/skills-passport", description: "See what you need to learn", badge: "Coming Soon" },
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
      { label: "Neurodiversity & Disability", to: "/resources/neurodiversity-disability", description: "Jobs, support and inclusive employers" },
    ],
  },
];

const JOBS: DropdownItem[] = [
  { label: "Jobs Marketplace", to: "/marketplace", description: "Browse all live roles" },
  { label: "Howdy Jobs", to: "/my-jobs?tab=jobs", description: "Roles matched to your profile" },
  { label: "CV Builder", to: "/cv-builder", description: "Build a profile that stands out" },
  { label: "Help Me Apply", to: "/help-me-apply", description: "AI cover letters & applications", badge: "New" },
  { label: "Interview Prep", to: "/resources/interview-skills", description: "Practice and prepare" },
];

const COMMUNITY: DropdownItem[] = [
  { label: "Feed", to: "/feed", description: "Industry news, videos & briefings" },
  { label: "People", to: "/community", description: "Members, chat & connections" },
  { label: "Events", to: "/events", description: "What's on in your industry" },
  { label: "Mentors", to: "/mentoring", description: "Learn from people already doing it" },
  { label: "Help", divider: true },
  { label: "The Mix", href: "https://www.themix.org.uk", description: "Free support for under 25s" },
  { label: "Shout", href: "https://www.giveusashout.org", description: "24/7 crisis text line" },
  { label: "National Careers Service", href: "https://nationalcareers.service.gov.uk", description: "Free careers guidance" },
];

/* -------------------------------------------------------------------------- */
/*  Main header                                                                */
/* -------------------------------------------------------------------------- */

type SiteHeaderProps = {
  /** Use absolute positioning over a hero. Defaults to relative bar. */
  overlay?: boolean;
  /** Show the brand wordmark on the left (default true on non-overlay). */
  showLogo?: boolean;
};

const SiteHeader = ({ overlay = false, showLogo }: SiteHeaderProps) => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  // Default: hide logo on overlay (hero already has speech bubble), show otherwise
  const renderLogo = showLogo ?? !overlay;

  useEffect(() => {
    let active = true;
    if (!user) {
      setPhotoUrl(null);
      setFirstName(null);
      return;
    }
    (async () => {
      const meta = (user.user_metadata as any) || {};
      const metadataPhoto = meta.avatar_url || meta.picture || null;
      const { data } = await supabase
        .from("profiles")
        .select("photo_url, full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setPhotoUrl((data as any)?.photo_url || metadataPhoto || null);
      const fullName = (data as any)?.full_name as string | null;
      const profileFirst = fullName ? fullName.trim().split(/\s+/)[0] : null;
      const metaFirst =
        meta.first_name ||
        (typeof meta.full_name === "string" ? meta.full_name.split(" ")?.[0] : null) ||
        (typeof meta.name === "string" ? meta.name.split(" ")?.[0] : null);
      setFirstName(profileFirst || metaFirst || null);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const navClass = overlay
    ? "absolute top-0 inset-x-0 z-30"
    : "relative z-40 bg-background";

  return (
    <>
      <nav
        className={`${navClass} px-3 sm:px-5 md:px-6 lg:px-10 pt-16 md:pt-7 pb-5 md:pb-7 flex items-center justify-between gap-2 sm:gap-3 md:gap-4`}
      >
        {/* LEFT: logo + groups */}
        <div className="flex items-center gap-5 md:gap-7 lg:gap-10 min-w-0">
          {renderLogo && (
            <Link
              to="/"
              className="font-display font-900 text-xl md:text-2xl leading-[1.02] tracking-tight text-foreground hover:opacity-80 transition-opacity"
              aria-label="How do you do?"
            >
              Howdoyoudo<span style={{ color: LIME }}>?</span>
              {firstName ? (
                <>
                  <br />
                  <span style={{ color: LIME }}>{firstName}</span>
                </>
              ) : null}
            </Link>
          )}

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <NavDropdown label="Inspire" items={INSPIRE} />
            <NavDropdown label="Discover" items={DISCOVER} />
            <GroupedNavDropdown label="Level Up" groups={LEVEL_UP_GROUPS} />
            <NavDropdown label="Jobs" items={JOBS} />
            <NavDropdown label="Community" items={COMMUNITY} />
          </div>
        </div>

        {/* RIGHT: auth */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
          {user ? (
            <div ref={accountRef} className="hidden sm:block relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Profile menu"
                aria-expanded={accountOpen}
                className="w-11 h-11 rounded-full overflow-hidden border-2 border-foreground bg-background hover:opacity-90 transition-opacity shadow-[2px_2px_0_hsl(var(--foreground))]"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Your profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 font-display font-900 text-foreground text-base">
                    {firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-background border-2 border-foreground rounded-xl shadow-[4px_4px_0_0_hsl(var(--foreground))] overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b-2 border-foreground/10 font-body text-xs text-foreground/60 truncate">
                      {user.email}
                    </div>
                    <Link
                      to="/my-profile"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-3 font-display font-900 text-sm uppercase tracking-wide text-foreground hover:bg-primary transition-colors"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-3 font-display font-900 text-sm uppercase tracking-wide text-foreground hover:bg-primary transition-colors border-t-2 border-foreground/10"
                    >
                      Take the Quiz
                    </Link>
                    <Link
                      to="/terms"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-3 font-display font-900 text-sm uppercase tracking-wide text-foreground hover:bg-primary transition-colors border-t-2 border-foreground/10"
                    >
                      Privacy &amp; Account
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setAccountOpen(false);
                        await signOut();
                      }}
                      className="w-full text-left block px-4 py-3 font-display font-900 text-sm uppercase tracking-wide text-foreground hover:bg-primary transition-colors border-t-2 border-foreground/10"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : authLoading ? null : (
            <Link
              to="/auth"
              className="hidden sm:inline-block hover:opacity-90 transition-opacity"
            >
              <SketchCta>Sign In</SketchCta>
            </Link>
          )}


          {/* Mobile-only avatar + hamburger menu (shared component) */}
          <GlobalMobileMenu showAvatar panelTopClass="top-20" />
        </div>
      </nav>

    </>
  );
};


export default SiteHeader;
