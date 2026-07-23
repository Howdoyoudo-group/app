// PlanTab — "The Plan": the new centre of Level Up. Howdy's honest opening
// take on the user's active target role, followed by their Coach Plan
// checklist, followed by a CTA to keep going with Howdy directly.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CoachPlanPanel from "@/components/CoachPlanPanel";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-assistant`;

function HowdyTake() {
  const { user } = useAuth();
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) { setLoading(false); return; }
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
        if (!resp.ok) { if (!cancelled) setLoading(false); return; }
        const data = await resp.json();
        if (!cancelled) setNarrative(data?.narrative || null);
      } catch {
        // Silent fail - the checklist below still works without the narrative.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  return (
    <div className="border-2 border-foreground rounded-2xl p-5 mb-5 bg-primary/5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="font-display font-900 text-xs uppercase tracking-widest">Howdy's take</p>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3.5 bg-foreground/10 rounded animate-pulse w-full" />
          <div className="h-3.5 bg-foreground/10 rounded animate-pulse w-4/5" />
        </div>
      ) : (
        <p className="font-body text-sm leading-relaxed">
          {narrative || "Set a target role and I'll give you an honest read on where you stand."}
        </p>
      )}
    </div>
  );
}

export default function PlanTab() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="font-display font-700 text-lg mb-2">Sign in to see your plan</p>
        <p className="font-body text-sm text-muted-foreground">Howdy builds it from your skills, CV and target role.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-1">Your Plan</h2>
        <p className="font-body text-sm text-muted-foreground">
          Howdy's honest read on where you stand, and exactly what to do next.
        </p>
      </div>

      <HowdyTake />
      <CoachPlanPanel />

      <div className="mt-6 p-5 border-2 border-border rounded-2xl bg-muted/20 flex items-start gap-4">
        <MessageCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-display font-800 text-sm mb-0.5">Want to talk it through?</p>
          <p className="font-body text-xs text-muted-foreground mb-3">
            Howdy can dig into any of this with you - your gaps, your CV, or just what to focus on first.
          </p>
          <button
            onClick={() => window.dispatchEvent(new Event("howdy:open"))}
            className="inline-flex items-center gap-1.5 font-display font-700 text-xs text-primary hover:opacity-80 transition-opacity"
          >
            Continue with Howdy
          </button>
        </div>
      </div>

      <p className="font-body text-xs text-muted-foreground mt-6">
        Not ready to focus on one role yet? <Link to="/roles" className="text-primary hover:underline">Browse roles</Link> or head to{" "}
        <Link to="/skills-passport?tab=assessment" className="text-primary hover:underline">Skills Assessment</Link>.
      </p>
    </div>
  );
}
