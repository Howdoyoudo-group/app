import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import howdyMascot from "@/assets/howdy-mascot.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Stop = { route: string; title: string; line: string };

const STOPS: Stop[] = [
  { route: "/", title: "Welcome home", line: "Welcome to Howdoyoudo? This is where you discover work you love. You’ll find everything you need to explore industries, find roles, and land jobs that matter." },
  { route: "/using-our-site", title: "Your guide", line: "New here? Start with our guide ‘Using our Site’ - it walks you through the entire journey from inspiration to your first job." },
  { route: "/the-show", title: "Get inspired", line: "Watch The HDYD Show - episodes, pitches, and street interviews with people doing jobs you may never have heard of. Watch, listen, or read - whatever works for you." },
  { route: "/articles", title: "Read and learn", line: "Explore curated articles from The School of Life, our Substack newsletter, and industry insights. The goal is simple: stumble onto something you didn’t know existed." },
  { route: "/#series", title: "Discover 30+ industries", line: "Scroll down and choose an industry to explore - from fashion and football to farming and Formula 1. Each tile opens a full breakdown with careers, companies, and jobs." },
  { route: "/fashion", title: "Inside an industry", line: "This is the industry page template - Watch/Read/Listen to content, explore the Career Map, see who’s hiring, and find your role. Every industry follows the same shape." },
  { route: "/fashion#plan", title: "Career Map - Plan your role", line: "See how careers progress in this industry. Explore different paths, understand what skills matter, and find roles that match your interests." },
  { route: "/fashion#watch", title: "Watch / Read / Listen", line: "Curated videos, articles, and podcasts - all UK-focused and handpicked. Get inspired by real people in the industry." },
  { route: "/fashion#work", title: "Meet the companies", line: "Explore companies hiring in this industry. See their values, what employees say about them, and whether they match your goals - before you apply." },
  { route: "/fashion#apply", title: "Find jobs", line: "Live roles in this industry are right here. Scroll, filter by role or salary, or use our AI search and I’ll find matches for you." },
  { route: "/marketplace", title: "Jobs Marketplace", line: "Our curated jobs board, organized by industry. Filter, search, get AI suggestions, or build your CV to stand out. Every job is vetted and real." },
  { route: "/match-me", title: "Your Matches", line: "Curious what’s right for you? See your personality, values, and how they match with different industries and roles - including surprising combinations." },
  { route: "/skills-passport", title: "Your Plan & Skills", line: "Honest checklist for your target role. Rate your skills, find your gaps, earn industry badges as you close them, and download your progress anytime." },
  { route: "/resources/online-courses", title: "Level Up", line: "Full learning hub - CV tips, further education, online courses, mentoring, interview skills, internships, apprenticeships, and how to stand out." },
  { route: "/my-jobs", title: "Your Inbox", line: "This is where it happens - set your industries, get daily news feeds and job suggestions. I’ll place matching roles in your Inbox overnight. I can also connect you directly with employers." },
  { route: "/community", title: "Join the community", line: "Real people exploring real careers. Ask questions, share what you’re exploring, get support, and attend events to see industries up close." },
  { route: "/my-profile", title: "Your profile", line: "Tell me about yourself - your interests, skills, and dreams. The more you share, the better I get at finding roles that match who you are." },
  { route: "/", title: "Me - your Howdy", line: "I’m right here in the corner. Chat with me about anything - an industry you’re curious about, a role you don’t understand, or what comes next. I’ve read the whole site and I’m here to help." },
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
