import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Tuned to be a rare, gentle nudge - not a nag. Two distinct "looks lost"
// signals, either of which can fire:
//   - idle: no interaction for a while on a page where getting stuck
//     actually means something (search, onboarding, tracker, etc.)
//   - thrash: bouncing back and forth between the same couple of pages,
//     the classic "I can't find what I'm after" pattern.
const IDLE_THRESHOLD_MS = 30_000;
const MIN_DWELL_MS = 10_000;
const THRASH_WINDOW_MS = 60_000;
const THRASH_MIN_REVISITS = 3;
const SESSION_CAP = 2;
const COOLDOWN_MS = 5 * 60_000;
const CHECK_INTERVAL_MS = 5_000;

export type LostReason = "idle" | "thrash" | null;

/**
 * Detects two "you might be stuck" patterns - long idle on a task page, or
 * thrashing between the same pages - and exposes a nudge state a caller can
 * use to draw Howdy's attention without auto-opening chat. Capped per
 * session and cooled down between nudges so it never nags.
 */
export function useLooksLost(enabled: boolean) {
  const location = useLocation();
  const [looksLost, setLooksLost] = useState(false);
  const [reason, setReason] = useState<LostReason>(null);
  const lastActivityRef = useRef(Date.now());
  const pageEnteredAtRef = useRef(Date.now());
  const visitsRef = useRef<{ path: string; at: number }[]>([]);
  const lastNudgeAtRef = useRef(0);
  const nudgeCountRef = useRef(0);

  useEffect(() => {
    try {
      nudgeCountRef.current = Number(sessionStorage.getItem("howdy_lost_nudge_count") || "0");
      lastNudgeAtRef.current = Number(sessionStorage.getItem("howdy_lost_last_nudge_at") || "0");
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const markActive = () => { lastActivityRef.current = Date.now(); };
    const events: Array<keyof WindowEventMap> = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, markActive));
  }, [enabled]);

  useEffect(() => {
    const now = Date.now();
    pageEnteredAtRef.current = now;
    lastActivityRef.current = now;
    const visits = visitsRef.current.filter((v) => now - v.at < THRASH_WINDOW_MS);
    visits.push({ path: location.pathname, at: now });
    visitsRef.current = visits;
  }, [location.pathname]);

  useEffect(() => {
    if (!enabled) return;
    const canNudge = () =>
      nudgeCountRef.current < SESSION_CAP && Date.now() - lastNudgeAtRef.current > COOLDOWN_MS;

    const trigger = (why: NonNullable<LostReason>) => {
      if (!canNudge()) return;
      setLooksLost(true);
      setReason(why);
      nudgeCountRef.current += 1;
      lastNudgeAtRef.current = Date.now();
      try {
        sessionStorage.setItem("howdy_lost_nudge_count", String(nudgeCountRef.current));
        sessionStorage.setItem("howdy_lost_last_nudge_at", String(lastNudgeAtRef.current));
      } catch { /* ignore */ }
    };

    const interval = setInterval(() => {
      if (looksLost || document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - pageEnteredAtRef.current > MIN_DWELL_MS && now - lastActivityRef.current > IDLE_THRESHOLD_MS) {
        trigger("idle");
        return;
      }
      const counts = new Map<string, number>();
      for (const v of visitsRef.current) counts.set(v.path, (counts.get(v.path) ?? 0) + 1);
      if ([...counts.values()].some((c) => c >= THRASH_MIN_REVISITS)) trigger("thrash");
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, looksLost]);

  const dismiss = () => {
    setLooksLost(false);
    setReason(null);
    lastActivityRef.current = Date.now();
  };

  return { looksLost, reason, dismiss };
}
