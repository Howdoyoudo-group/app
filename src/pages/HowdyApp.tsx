import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import howdyMascot from "@/assets/howdy-mascot.png";
import { HowdyVoiceButtonWrapped as HowdyVoiceButton } from "@/components/HowdyVoiceButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-assistant`;

const HowdyApp = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const shouldOpenVideo = searchParams.get("video") === "1" || searchParams.get("howdy") === "video";
  const [showIntroVideo, setShowIntroVideo] = useState(shouldOpenVideo);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Howdy! 👋 I'm your AI sidekick. Tap the mic to talk, or type below to chat." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });
  }, [messages]);

  useEffect(() => {
    if (shouldOpenVideo) setShowIntroVideo(true);
  }, [shouldOpenVideo]);

  // Manifest + apple-touch icon for /howdy are swapped synchronously by an
  // inline script in index.html (so Safari sees them before "Add to Home
  // Screen" reads them). Nothing to do here.

  const send = useCallback(async (overrideText?: string) => {
    if (!user) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "To chat with me, you'll need to create a free account first! 👉 [Sign up here](/auth)",
        },
      ]);
      return;
    }

    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (!overrideText) setInput("");

    const userMsg: Msg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
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
        upsert("Please sign in again to use Howdy.");
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
          mode: "candidate",
          messages: updated,
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
  }, [input, loading, messages, user]);

  // Signed-out: video background + prominent sign-in CTA
  if (!user) {
    if (shouldOpenVideo) {
      return (
        <div className="fixed inset-0 flex flex-col bg-foreground">
          <SEO
            title="Howdy — your AI sidekick"
            description="Chat or talk to Howdy, your pocket AI sidekick from How Do You Do?"
          />
          <Link to="/" className="absolute left-4 top-4 z-10 rounded-full border-2 border-background bg-foreground/80 px-3 py-1 text-xs font-bold uppercase text-background">
            ← Home
          </Link>
          <video
            src="/howdy-intro.mp4"
            autoPlay
            controls
            playsInline
            className="h-full w-full object-contain"
          />
          <Link
            to="/auth?redirect=/howdy"
            className="absolute bottom-6 left-1/2 z-10 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded-2xl border-2 border-foreground bg-background text-foreground text-center px-6 py-4 font-display text-lg shadow-[4px_4px_0_hsl(var(--primary))]"
          >
            Sign in to chat
          </Link>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: "#00E600" }}>
        <SEO
          title="Howdy — your AI sidekick"
          description="Chat or talk to Howdy, your pocket AI sidekick from How Do You Do?"
        />
        <video
          src="/howdy-intro.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-between px-6 pt-10"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
        >
          <Link to="/" className="self-start text-xs font-bold uppercase tracking-wider text-white/90">
            ← Home
          </Link>

          <div className="flex flex-col items-center">
            <h1 className="font-display text-6xl sm:text-7xl text-white text-center leading-none drop-shadow-[3px_3px_0_rgba(0,0,0,0.9)]">
              Howdy
            </h1>
            <p className="mt-3 text-white text-lg font-semibold text-center drop-shadow-[2px_2px_0_rgba(0,0,0,0.9)]">
              your AI sidekick
            </p>
          </div>

          <Link
            to="/auth?redirect=/howdy"
            className="w-full max-w-xs rounded-2xl border-2 border-foreground bg-white text-foreground text-center px-6 py-5 font-display text-xl shadow-[4px_4px_0_rgba(0,0,0,0.9)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_rgba(0,0,0,0.9)]"
          >
            Sign in to chat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#00E600" }}
    >
      <SEO
        title="Howdy — your AI sidekick"
        description="Chat or talk to Howdy, your pocket AI sidekick from How Do You Do?"
      />

      <AnimatePresence>
        {showIntroVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col bg-foreground"
          >
            <button
              onClick={() => setShowIntroVideo(false)}
              className="absolute right-3 top-3 z-10 rounded-full border-2 border-background bg-foreground/80 p-2 text-background"
              aria-label="Close video"
            >
              ×
            </button>
            <video
              src="/howdy-intro.mp4"
              autoPlay
              controls
              playsInline
              className="h-full w-full object-contain"
              onEnded={() => setShowIntroVideo(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiny home link, top-left, doesn't compete */}
      <Link
        to="/"
        className="absolute top-3 left-3 z-10 text-[11px] font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground"
      >
        ← Home
      </Link>

      {/* Hero: Howdy always visible (doesn't scroll) */}
      <div className="shrink-0 flex flex-col items-center px-6 pt-8 pb-1">
        <motion.img
          src={howdyMascot}
          alt="Howdy"
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="w-[min(38vw,180px)] h-auto object-contain drop-shadow-[6px_6px_0_rgba(0,0,0,0.9)]"
        />
        <h1 className="mt-2 font-display text-2xl sm:text-3xl text-foreground text-center leading-none">
          Howdy
        </h1>
        <p className="mt-0.5 text-foreground/80 text-xs font-semibold text-center">
          your AI sidekick
        </p>
      </div>

      {/* Chat transcript (scrolls, fills remaining space) */}
      <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-2">
          <AnimatePresence initial={false}>
            {messages.slice(-6).map((m, i) => (
              <motion.div
                key={`${i}-${m.role}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl border-2 border-foreground bg-foreground text-background px-3 py-2 text-sm shadow-[2px_2px_0_rgba(0,0,0,0.9)]"
                      : "max-w-[85%] rounded-2xl border-2 border-foreground bg-background text-foreground px-3 py-2 text-sm shadow-[2px_2px_0_rgba(0,0,0,0.9)]"
                  }
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noreferrer" className="underline" />
                      ),
                      p: ({ node, ...props }) => <p {...props} className="m-0" />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border-2 border-foreground bg-background px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer + voice */}
      <div
        className="border-t-2 border-foreground bg-background/95 backdrop-blur px-3 pt-2"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-md items-end gap-2">
          <div className="shrink-0">
            <HowdyVoiceButton
              onTranscript={(role, content) => {
                if (role === "user") send(content);
              }}
            />
          </div>
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
            rows={1}
            placeholder="Ask Howdy anything…"
            className="flex-1 resize-none rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-32"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl border-2 border-foreground bg-foreground text-background p-2 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowdyApp;
