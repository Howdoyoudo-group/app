import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import howdyMascot from "@/assets/howdy-mascot.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Stop = { route: string; title: string; line: string };

const STOPS: Stop[] = [
  { route: "/", title: "Home", line: "This is the home page. Navigate to Industries, Roles, Job Search, anywhere - or jump to My Inbox or My Profile." },
  { route: "/#series", title: "The industries", line: "Scroll down and choose an industry to unpack - each tile opens a full breakdown." },
  { route: "/fashion", title: "An example industry page", line: "Eight tabs from Plan to Jobs. Same shape every time so you always know where you are." },
  { route: "/fashion#watch", title: "Plan / Watch / Read / Listen", line: "Briefings, videos, articles and podcasts - all curated, all UK-focused." },
  { route: "/fashion#apply", title: "Jobs tab (the green one)", line: "Live roles in this industry. The green tab is where the actual jobs hide." },
  { route: "/marketplace?industry=fashion", title: "Jobs Marketplace", line: "We've scoured the web and our contacts to find jobs by industry - here's Fashion as an example. Filter by role or hit Search & Filter to narrow down further, or use our AI search and I'll do it for you." },
  { route: "/my-jobs", title: "MyInbox", line: "This is where the action happens - choose your industries and get daily news feeds and analysis. Overnight I’ll magically place matching jobs in your Inbox. I’ll also introduce you to employers and they can email you directly." },
  { route: "/learning", title: "Learning Hub", line: "A whole learning hub for anyone interested in the world of work - interviews, CVs, skills and courses." },
  { route: "/my-profile", title: "Understand Me", line: "If you haven't set up your profile with me yet, do it here - or edit anytime. We'll also create an amazing magazine for you that you can download or print whenever you like." },
  { route: "/briefings", title: "Daily briefing", line: "Magazine-style morning round-up for the industries you've subscribed to. Here are real examples - subscribe from any industry page to get yours by email." },
  { route: "/", title: "Me - the floating Howdy", line: "I live here. Ask me anything. The more we talk, the better I get at finding the right roles for you." },
];

const STORAGE_KEY = "howdy_tour_state_v1";

type TourState = { active: boolean; stop: number };

let setTourExternal: ((active: boolean) => void) | null = null;

export const launchHowdyTour = () => {
  setTourExternal?.(true);
};

export default function HowdyTour() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<TourState>({ active: false, stop: 0 });

  // expose launcher
  useEffect(() => {
    setTourExternal = (active) => setState({ active, stop: 0 });
    return () => { setTourExternal = null; };
  }, []);

  // restore in-progress tour after navigation
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TourState;
        if (parsed.active) setState(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  const goTo = useCallback((stopIdx: number) => {
    const clamped = Math.max(0, Math.min(STOPS.length - 1, stopIdx));
    const stop = STOPS[clamped];
    if (!stop) return;
    setState({ active: true, stop: clamped });
    let route = stop.route;
    // Signed-out users get demo versions of gated pages
    if (!user) {
      if (route === "/my-jobs") route = "/my-jobs-demo";
      else if (route === "/my-profile") route = "/my-profile-demo";
    }
    const [path, hash] = route.split("#");
    navigate(hash ? `${path}#${hash}` : path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [navigate, user]);

  const close = useCallback(async (completed: boolean) => {
    setState({ active: false, stop: 0 });
    sessionStorage.removeItem(STORAGE_KEY);
    if (completed && user) {
      await supabase.from("profiles").update({ howdy_tour_completed_at: new Date().toISOString() }).eq("id", user.id);
    }
  }, [user]);

  if (!state.active) return null;

  const stop = STOPS[state.stop];
  const isFirst = state.stop === 0;
  const isLast = state.stop === STOPS.length - 1;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key="howdy-tour-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:bottom-6 md:max-w-md z-[60] rounded-2xl border-2 border-foreground bg-background shadow-[6px_6px_0_hsl(var(--foreground))] p-4 pointer-events-auto"
        role="dialog"
        aria-label={`Howdy tour: ${stop.title}`}
      >
        <div className="flex items-start gap-3">
          <img src={howdyMascot} alt="Howdy" className="h-14 w-14 shrink-0 object-contain" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Howdy · stop {state.stop + 1} of {STOPS.length}
              </p>
              <button
                onClick={() => close(false)}
                aria-label="Close tour"
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-bold text-base mb-1">{stop.title}</h3>
            <p className="text-sm leading-relaxed text-foreground">{stop.line}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => goTo(state.stop - 1)}
                disabled={isFirst}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => close(false)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Skip
                </button>
                {isLast ? (
                  <button
                    onClick={() => close(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                  >
                    Finish
                  </button>
                ) : (
                  <button
                    onClick={() => goTo(state.stop + 1)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
