import { useState, useRef } from "react";
import { Loader2, Briefcase, Building2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const INDUSTRIES = [
  "Football", "Music", "Fashion", "Cinema & Film", "Gaming", "Journalism",
  "Farming", "Health", "Beer & Drinks", "Coffee", "Formula 1", "Jewellery",
  "Footwear", "Horse Racing", "Pets", "Money", "Charity", "Travel",
  "Interior Design", "Beauty", "Estate Agency", "Wellness", "Teaching",
  "Bakery", "Physiotherapy", "Cars", "Grocery", "Hospitality",
];

const SKILLS = ["Creative", "People", "Digital", "Practical"];

const SKILL_EMOJIS: Record<string, string> = {
  Creative: "🎨", People: "🤝", Digital: "💻", Practical: "🔧",
};

interface BlendResult {
  role: string;
  blend: string;
  description: string;
  why: string;
  example_companies: string[];
  search_query: string;
}

export function RoleMixer({ userIndustries = [] }: { userIndustries?: string[] }) {
  const industries = userIndustries.length >= 2 ? userIndustries : INDUSTRIES;

  const [ind1, setInd1] = useState(industries[0] || "Football");
  const [ind2, setInd2] = useState(industries[Math.min(1, industries.length - 1)] || "Music");
  const [skill, setSkill] = useState(SKILLS[0]);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const spinTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function callBlendRoles(i1: string, i2: string, sk: string) {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blend-roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ industry1: i1, industry2: i2, skill: sk }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResult(data);
      setRevealed(false);
      setTimeout(() => setRevealed(true), 100);
    } catch {
      setError("Couldn't generate that blend — try again!");
    } finally {
      setLoading(false);
    }
  }

  async function handleSpin() {
    if (spinning || loading) return;
    setSpinning(true);
    setResult(null);

    const newInd1 = industries[Math.floor(Math.random() * industries.length)];
    let newInd2 = industries[Math.floor(Math.random() * industries.length)];
    while (newInd2 === newInd1) newInd2 = industries[Math.floor(Math.random() * industries.length)];
    const newSkill = SKILLS[Math.floor(Math.random() * SKILLS.length)];

    spinTimeout.current = setTimeout(async () => {
      setInd1(newInd1);
      setInd2(newInd2);
      setSkill(newSkill);
      setSpinning(false);
      await callBlendRoles(newInd1, newInd2, newSkill);
    }, 1200);
  }

  async function handleCustomBlend() {
    if (ind1 === ind2) { setError("Pick two different industries!"); return; }
    setResult(null);
    await callBlendRoles(ind1, ind2, skill);
  }

  const isWorking = spinning || loading;

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-muted/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-foreground/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🎰</span>
          <h3 className="font-display font-900 text-lg uppercase tracking-wide">The What If Machine</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground">Dare us to find you a job you'd never think of. We'll blend two worlds and see what comes out.</p>
      </div>

      {/* Pickers + Spin */}
      <div className="px-5 py-4 space-y-4">
        {/* Industry pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">World 1</label>
            <select
              value={ind1}
              onChange={(e) => setInd1(e.target.value)}
              className="w-full bg-background text-foreground text-sm rounded-xl px-3 py-2.5 border-2 border-foreground/10 focus:outline-none focus:border-primary font-display font-700"
            >
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">World 2</label>
            <select
              value={ind2}
              onChange={(e) => setInd2(e.target.value)}
              className="w-full bg-background text-foreground text-sm rounded-xl px-3 py-2.5 border-2 border-foreground/10 focus:outline-none focus:border-primary font-display font-700"
            >
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* Skill pills */}
        <div>
          <label className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Your skill type</label>
          <div className="flex gap-2 flex-wrap">
            {SKILLS.map((s) => (
              <button
                key={s}
                onClick={() => setSkill(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-700 transition-all ${skill === s ? "bg-primary text-primary-foreground border-2 border-primary" : "bg-background border-2 border-foreground/10 text-foreground hover:border-foreground/30"}`}
              >
                {SKILL_EMOJIS[s]} {s}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSpin}
            disabled={isWorking}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display font-900 text-sm uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {spinning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Picking something wild…</>
            ) : (
              <>🎲 Surprise me</>
            )}
          </button>
          <button
            onClick={handleCustomBlend}
            disabled={isWorking}
            className="px-4 py-3 rounded-xl border-2 border-foreground/20 text-foreground font-display font-700 text-xs uppercase tracking-wide hover:border-foreground/40 transition-colors disabled:opacity-50"
          >
            {loading && !spinning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go →"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 pb-4">
          <p className="text-red-500 text-xs font-body">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !spinning && (
        <div className={`border-t-2 border-foreground/10 px-5 py-5 transition-all duration-500 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <p className="font-body text-xs text-muted-foreground mb-3">What if you were a…</p>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-display font-900 text-[10px] uppercase tracking-wide mb-1">
                {result.blend}
              </span>
              <h4 className="font-display font-900 text-2xl leading-tight">{result.role}</h4>
            </div>
          </div>

          <p className="font-body text-sm text-muted-foreground mb-2 leading-relaxed">{result.description}</p>
          <p className="font-body text-xs text-primary italic mb-3">"{result.why}"</p>

          {result.example_companies?.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              <Building2 className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-body text-xs text-muted-foreground">{result.example_companies.join(" · ")}</span>
            </div>
          )}

          <div className="flex gap-2">
            <a
              href={`/my-jobs?tab=jobs&q=${encodeURIComponent(result.search_query || result.role)}`}
              className="flex-1 py-2.5 rounded-xl bg-foreground text-background font-display font-900 text-xs uppercase tracking-wide text-center hover:opacity-90 transition-opacity"
            >
              Could you do this? →
            </a>
            <button
              onClick={handleSpin}
              disabled={isWorking}
              className="px-4 py-2.5 rounded-xl border-2 border-foreground/20 text-foreground font-display font-700 text-xs uppercase tracking-wide hover:border-foreground/40 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
