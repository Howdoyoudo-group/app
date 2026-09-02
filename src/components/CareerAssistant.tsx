import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, HelpCircle, Compass, Play } from "lucide-react";
import { launchHowdyTour } from "@/components/HowdyTour";
import { HowdyVoiceButtonWrapped as HowdyVoiceButton } from "@/components/HowdyVoiceButton";
import howdyMascot from "@/assets/howdy-mascot.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CoachPlanPanel from "@/components/CoachPlanPanel";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-assistant`;

const WELCOME_CANDIDATE = `__WELCOME_CARD__`;

const WelcomeCard = ({
  mode,
  onSearchRole,
  onSearchCompany,
  onTakeTour,
}: {
  mode: "candidate" | "employer";
  onSearchRole: () => void;
  onSearchCompany: () => void;
  onTakeTour: () => void;
}) => {
  const isEmployer = mode === "employer";
  return (
    <div className="relative w-full max-w-[92%] rounded-2xl border-2 border-foreground bg-background px-4 py-4 shadow-[3px_3px_0_hsl(var(--foreground))]">
      {/* doodle squiggle accent */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 14"
        className="absolute -top-3 left-6 h-3 w-24 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M2 8 Q 12 1, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 118 8" />
      </svg>

      <div className="flex items-start gap-3">
        <img
          src={howdyMascot}
          alt="Howdy"
          className="h-14 w-14 shrink-0 object-contain"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] leading-snug">
            <span className="font-display font-700 uppercase tracking-wider text-xs text-primary mr-2">
              Howdy
            </span>
            Hey! 👋 I'm your AI sidekick. Here's what I can do:
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 text-sm leading-snug pl-1">
        {isEmployer ? (
          <>
            <li>🎯 Find and shortlist <strong>matched candidates</strong></li>
            <li>📝 Write better <strong>job posts</strong></li>
            <li>🏢 Sharpen your <strong>company profile</strong></li>
            <li>📊 Make sense of your <strong>dashboard stats</strong></li>
          </>
        ) : (
          <>
            <li>🔎 Search for a <strong>role</strong>, <strong>company</strong> or <strong>industry</strong></li>
            <li>✏️ Find the right <strong>industry</strong> or <strong>role</strong> for you</li>
            <li>🗒️ Navigate the <strong>jobs board</strong> &amp; application tools</li>
            <li>📓 Discover <strong>courses</strong>, <strong>degrees</strong> &amp; learning</li>
            <li>🏷️ Explore <strong>company profiles</strong> &amp; pathways</li>
          </>
        )}
      </ul>

      {!isEmployer && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={onSearchRole}
            className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-background px-2.5 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0_hsl(var(--foreground))]"
          >
            🔎 Search a role
          </button>
          <button
            onClick={onSearchCompany}
            className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-background px-2.5 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0_hsl(var(--foreground))]"
          >
            🏷️ Search a company
          </button>
          <button
            onClick={onTakeTour}
            className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-primary text-primary-foreground px-2.5 py-1 text-xs font-semibold hover:opacity-90 transition-opacity shadow-[2px_2px_0_hsl(var(--foreground))]"
          >
            🧭 Take the tour
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground italic">
        What would you like to explore?
      </p>
    </div>
  );
};

const WELCOME_EMPLOYER = `Hey! 👋 I'm **Howdy**, your employer assistant. I can help you:

- 🎯 Find and shortlist **matched candidates** for your roles
- 📝 Write better **job posts** that attract the right people
- 🏢 Sharpen your **company profile** to stand out
- 📊 Make sense of your **dashboard stats** and engagement

What would you like to work on?`;

const CareerAssistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isEmployerArea = /^\/employer/i.test(location.pathname);
  const [mode, setMode] = useState<"candidate" | "employer">("candidate");
  const [open, setOpen] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(true); // default true until checked
  const [isPremium, setIsPremium] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: WELCOME_CANDIDATE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Detect premium / admin role to make Howdy front-and-centre.
  useEffect(() => {
    let cancelled = false;
    if (!user) { setIsPremium(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      setIsPremium((data ?? []).some((r: { role: string }) => r.role === "premium" || r.role === "admin"));
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Howdy never auto-opens — users open the chat on demand via the floating button.

  // Allow any part of the app (e.g. the MyJobs bottom nav "Howdy" button) to
  // open the chat panel via a global event, so we don't need two competing
  // entry points stacked on top of each other.
  useEffect(() => {
    // Optional `detail.prefill` lets a caller (e.g. a Job Tracker card) open
    // Howdy with a relevant message already typed in, without auto-sending it.
    const handler = (e: Event) => {
      const prefill = (e as CustomEvent<{ prefill?: string }>).detail?.prefill;
      if (prefill) setInput(prefill);
      setOpen(true);
    };
    const videoHandler = () => { setOpen(true); setShowVideo(true); };
    window.addEventListener("howdy:open", handler);
    window.addEventListener("howdy:open-video", videoHandler);
    return () => {
      window.removeEventListener("howdy:open", handler);
      window.removeEventListener("howdy:open-video", videoHandler);
    };
  }, []);

  // Deep-link support: ?howdy=open or ?howdy=video (the latter auto-plays the intro video).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const howdy = params.get("howdy");
    if (howdy === "video" || params.get("video") === "1") {
      setOpen(true);
      setShowVideo(true);
    } else if (howdy === "open") {
      setOpen(true);
    }
  }, [location.search]);

  // On /my-jobs the bottom nav occupies the screen edge; lift the floater
  // so it sits clear of the nav instead of covering the "Howdy" button.
  const onMyJobs = location.pathname.startsWith("/my-jobs");


  // First-time auto-play of intro video when chat opens — only for
  // signed-out visitors. Signed-in users land on the green chat panel
  // directly (they can still hit "Intro" in the header to watch it).
  useEffect(() => {
    if (!open) return;
    if (user) return;
    const seen = localStorage.getItem("howdy_intro_video_seen");
    if (!seen) {
      setShowVideo(true);
      localStorage.setItem("howdy_intro_video_seen", "1");
    }
  }, [open, user]);

  // Proactive nudge: when a signed-in candidate with ≥1 target role opens
  // the chat for the first time this session, volunteer Howdy's real
  // verdict instead of the generic welcome card - mirrors the tour's
  // proactive style rather than waiting to be asked.
  useEffect(() => {
    if (!open || !user || mode !== "candidate") return;
    if (sessionStorage.getItem("howdy_proactive_shown")) return;
    const onlyWelcome = messages.length === 1 && messages[0].content === WELCOME_CANDIDATE;
    if (!onlyWelcome) return;
    sessionStorage.setItem("howdy_proactive_shown", "1");
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("user_target_roles")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (cancelled || !count) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) return;
      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            mode: "candidate",
            planNarrative: true,
            messages: [{ role: "user", content: "What's my plan?" }],
          }),
        });
        if (!resp.ok || cancelled) return;
        const data = await resp.json();
        if (data?.narrative) {
          setMessages((prev) => {
            const onlyWelcomeNow = prev.length === 1 && prev[0].content === WELCOME_CANDIDATE;
            if (!onlyWelcomeNow) return prev;
            return [{ role: "assistant", content: data.narrative }];
          });
        }
      } catch {
        // Silent fail - the static welcome card stays as-is.
      }
    })();
    return () => { cancelled = true; };
  }, [open, user, mode, messages]);

  // Check tour completion status
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("howdy_tour_completed_at")
          .eq("id", user.id)
          .single();
        if (!cancelled) {
          setTourCompleted(!!data?.howdy_tour_completed_at);
        }
      } else {
        const localDone = localStorage.getItem("howdy_tour_completed_at");
        if (!cancelled) setTourCompleted(!!localDone);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Throttled, non-smooth scroll - smooth scroll on every streamed token freezes mobile Safari
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Employer mode only inside the employer area (and only if user actually has the employer role)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isEmployerArea || !user) {
        if (!cancelled) {
          setMode("candidate");
          setMessages((prev) => {
            const onlyWelcome = prev.length === 1 && prev[0].role === "assistant";
            if (!onlyWelcome) return prev;
            return [{ role: "assistant", content: WELCOME_CANDIDATE }];
          });
        }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isEmployer = !!data?.some((r) => r.role === "employer");
      if (cancelled) return;
      const nextMode = isEmployer ? "employer" : "candidate";
      setMode(nextMode);
      setMessages((prev) => {
        const onlyWelcome = prev.length === 1 && prev[0].role === "assistant";
        if (!onlyWelcome) return prev;
        return [
          {
            role: "assistant",
            content: nextMode === "employer" ? WELCOME_EMPLOYER : WELCOME_CANDIDATE,
          },
        ];
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isEmployerArea]);

  const startTourFromChat = useCallback(() => {
    setOpen(false);
    launchHowdyTour();
  }, []);

  const send = useCallback(async (overrideText?: string) => {
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "To chat with me, you'll need to create a free account first! 👉 [Sign up here](/auth)\n\nIt only takes a moment, and you'll also get access to our CV tools, job matching, and more." },
      ]);
      return;
    }

    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (!overrideText) setInput("");

    if (/^take\s+(the\s+)?tour\b/i.test(text)) {
      setOpen(false);
      launchHowdyTour();
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      // Hide internal memory directive from the rendered bubble.
      const display = assistantSoFar.replace(/\s*MEMORY::[^\n]*$/i, "").trimEnd();
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === updated.length + 1) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: display } : m
          );
        }
        return [...prev, { role: "assistant", content: display }];
      });
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        upsert("Please sign in again to use the career assistant.");
        setLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          mode,
          messages: updated.filter(
            (m) =>
              m.role === "user" ||
              (m.content !== WELCOME_CANDIDATE && m.content !== WELCOME_EMPLOYER)
          ),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        upsert(err.error || "Sorry, something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch {
      upsert("Sorry, I couldn't connect. Please try again.");
    }
    setLoading(false);
  }, [input, loading, messages, user, mode]);


  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && !onMyJobs && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed right-4 bottom-12 md:right-5 md:bottom-5 z-50 flex flex-col items-center gap-1"
          >
            <motion.button
              whileHover={{ scale: 1.05, rotate: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(true)}
              className="relative flex h-[clamp(4rem,18vw,7.5rem)] w-[clamp(4rem,18vw,7.5rem)] items-center justify-center rounded-full bg-background shadow-[4px_4px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-2 border-foreground overflow-hidden p-1"
              aria-label="Open Howdy, your AI sidekick"
            >
              <span className="absolute inset-0 rounded-full bg-primary/10" aria-hidden />
              <img src={howdyMascot} alt="Howdy" className="relative h-full w-full object-contain" />
            </motion.button>
            <span className="pointer-events-none rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-[2px_2px_0_hsl(var(--foreground))]">
              Howdy
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed right-4 md:right-6 z-50 flex w-[300px] md:w-[420px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border-2 border-foreground shadow-2xl overflow-hidden ${onMyJobs ? "bottom-[calc(6rem+env(safe-area-inset-bottom))]" : "bottom-4 md:bottom-6"}`}
            style={{ height: "min(440px, calc(100vh - 6rem))", backgroundColor: "#00E600" }}
          >
            {/* Intro video overlay */}
            <AnimatePresence>
              {showVideo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col bg-background"
                >
                  <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <Play className="h-4 w-4" /> Meet Howdy
                    </span>
                    <button
                      onClick={() => setShowVideo(false)}
                      className="rounded-full p-1 hover:bg-primary-foreground/20 transition-colors"
                      aria-label="Close video"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-black">
                    <video
                      src="https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/videos/howdy-intro.mp4"
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                      onEnded={() => setShowVideo(false)}
                    />
                  </div>
                  <button
                    onClick={() => setShowVideo(false)}
                    className="bg-muted text-foreground text-xs font-bold py-2 hover:bg-muted/80 transition-colors"
                  >
                    Skip & chat with Howdy →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header — labeled CTAs */}
            <div className="flex items-center justify-between gap-2 px-2 py-2 bg-[#00E600]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <Play className="h-3.5 w-3.5" /> Watch video
                </button>
                <button
                  onClick={() => { setOpen(false); launchHowdyTour(); }}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-background px-2.5 py-1 text-[11px] font-bold shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <Compass className="h-3.5 w-3.5" /> Take tour
                </button>
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-foreground text-background px-2.5 py-1 text-[11px] font-bold shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Chat
                </button>
                <div className="inline-flex items-center rounded-full border-2 border-foreground bg-background px-1 py-0.5 shadow-[2px_2px_0_hsl(var(--foreground))]">
                  <HowdyVoiceButton
                    onTranscript={(role, text) =>
                      setMessages((prev) => [...prev, { role, content: text }])
                    }
                  />
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 hover:bg-foreground/10 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mode === "candidate" && (
              <div className="px-3 pt-3 bg-[#00E600]">
                <CoachPlanPanel compact />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 flex flex-col" style={{ backgroundColor: "#00E600" }}>
              {(() => {
                const chatMsgs = messages.filter(
                  (m) => m.content !== WELCOME_CANDIDATE && m.content !== WELCOME_EMPLOYER
                );
                if (chatMsgs.length === 0) {
                  return (
                    <div className="flex-1 flex items-center justify-center">
                      <img
                        src={howdyMascot}
                        alt="Howdy"
                        className="max-h-[260px] max-w-[80%] object-contain"
                      />
                    </div>
                  );
                }
                return chatMsgs.map((m, i) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl border-2 border-foreground px-3 py-2 text-sm shadow-[2px_2px_0_hsl(var(--foreground))] ${
                          isUser ? "bg-foreground text-background" : "bg-background text-foreground"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-a:text-primary">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border-2 border-foreground bg-background px-3 py-2 text-sm">
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-bounce [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-bounce [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-end gap-2 border-t-2 border-foreground bg-background px-3 py-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={user ? "Ask Howdy anything..." : "Sign in to chat with Howdy"}
                rows={1}
                className="flex-1 resize-none rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-32"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-full bg-foreground text-background p-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerAssistant;
