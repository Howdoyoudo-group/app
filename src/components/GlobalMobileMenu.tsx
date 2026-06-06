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
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Inspiration",
    items: [
      { label: "The Show", to: "/the-show", description: "Our original series — coming soon" },
      { label: "Industries", href: "/#series", description: "Explore 30+ sectors" },
      { label: "Roles", to: "/roles", description: "By job, not just by title" },
      { label: "Side Hustles", to: "/side-hustles", description: "Turn what you love into income" },
      { label: "Start a Business", to: "/starting-a-business", description: "Your own thing" },
    ],
  },
  {
    label: "Level Up",
    items: [
      { label: "Learning Hub", to: "/learning", description: "Courses, books & podcasts" },
      { label: "Profile Builder", to: "/cv-builder", description: "Build a profile that stands out" },
    ],
  },
  {
    label: "Jobs",
    items: [
      { label: "Howdy Jobs", to: "/my-jobs?tab=jobs", description: "Roles matched to your profile" },
      { label: "Discover a Job", to: "/marketplace", description: "Browse all live roles" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Feed", to: "/feed", description: "Industry news, videos & briefings" },
      { label: "People", to: "/community", description: "Members, chat & connections" },
      { label: "Events", to: "/events", description: "What's on in your industry" },
      { label: "Mentor", to: "/mentoring", description: "Learn from people already doing it" },
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const location = useLocation();
  const closeMenu = () => { setOpen(false); setOpenSection(null); };

  useEffect(() => { closeMenu(); }, [location.pathname]);

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

  const allSections = user
    ? [...NAV_SECTIONS, { label: "Profile", items: PROFILE_ITEMS }]
    : NAV_SECTIONS;

  const activeSection = allSections.find((s) => s.label === openSection);

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
          onClick={() => { setOpen((v) => !v); setOpenSection(null); }}
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
              className={`md:hidden fixed ${panelTopClass} inset-x-4 z-50 bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] overflow-hidden`}
            >
              <AnimatePresence mode="wait">
                {/* TOP LEVEL — section list */}
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
                        onClick={() => setOpenSection(section.label)}
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

                {/* SECOND LEVEL — subsection items */}
                {openSection && activeSection && (
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

                    {activeSection.items.map((item) =>
                      item.to ? (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={closeMenu}
                          className="flex flex-col px-3 py-3 rounded-xl hover:bg-primary transition-colors border-2 border-transparent hover:border-foreground"
                        >
                          <span className="font-display font-900 text-base uppercase tracking-wide text-foreground">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="font-body text-xs text-foreground/50 mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={closeMenu}
                          className="flex flex-col px-3 py-3 rounded-xl hover:bg-primary transition-colors border-2 border-transparent hover:border-foreground"
                        >
                          <span className="font-display font-900 text-base uppercase tracking-wide text-foreground">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="font-body text-xs text-foreground/50 mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </a>
                      )
                    )}
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
