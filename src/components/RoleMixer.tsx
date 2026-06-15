import { useState } from "react";
import { Loader2, Search, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const INDUSTRIES = [
  "Football", "Music", "Fashion", "Cinema & Film", "Gaming", "Journalism",
  "Farming", "Beer & Drinks", "Coffee", "Formula 1", "Jewellery",
  "Horse Racing", "Pets", "Charity", "Travel",
  "Interior Design", "Beauty", "Estate Agency", "Teaching",
  "Bakery", "Cars", "Grocery", "Hospitality",
];

const SKILLS = ["Creative", "People", "Digital", "Practical"];

interface BlendRole {
  title: string;
  description: string;
}

interface BlendResult {
  blend: string;
  tagline: string;
  story: string;
  roles: BlendRole[];
}

function pickRandom<T>(arr: T[], exclude?: T): T {
  const pool = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function RoleMixer({ userIndustries = [] }: { userIndustries?: string[] }) {
  const industries = userIndustries.length >= 2 ? userIndustries : INDUSTRIES;

  const [ind1, setInd1] = useState(industries[0] || "Football");
  const [ind2, setInd2] = useState(industries[Math.min(1, industries.length - 1)] || "Music");
  const [skill, setSkill] = useState(SKILLS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function callBlend(i1: string, i2: string, sk: string) {
    setLoading(true);
    setError(null);
    setResult(null);
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
      if (!data.roles?.length) throw new Error("No roles returned");
      setResult(data);
      setTimeout(() => window.scrollBy({ top: 200, behavior: "smooth" }), 100);
    } catch {
      setError("Couldn't generate that blend — try again!");
    } finally {
      setLoading(false);
    }
  }

  function handleSurprise() {
    const newInd1 = pickRandom(industries);
    const newInd2 = pickRandom(industries, newInd1);
    const newSkill = pickRandom(SKILLS);
    setInd1(newInd1);
    setInd2(newInd2);
    setSkill(newSkill);
    callBlend(newInd1, newInd2, newSkill);
  }

  function handleGo() {
    if (ind1 === ind2) { setError("Pick two different industries!"); return; }
    callBlend(ind1, ind2, skill);
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-2xl border-2 border-foreground/10 bg-muted/20 p-5 space-y-4">
        <div>
          <p className="font-display font-900 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Pick two worlds to collide
          </p>
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
        </div>

        <div>
          <label className="font-display font-700 text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Your skill type</label>
          <div className="flex gap-2 flex-wrap">
            {SKILLS.map((s) => (
              <button
                key={s}
                onClick={() => setSkill(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-700 transition-all ${
                  skill === s
                    ? "bg-primary text-primary-foreground border-2 border-primary"
                    : "bg-background border-2 border-foreground/10 text-foreground hover:border-foreground/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSurprise}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display font-900 text-sm uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Finding your world…</>
            ) : (
              <><Shuffle className="w-4 h-4" /> Surprise me</>
            )}
          </button>
          <button
            onClick={handleGo}
            disabled={loading}
            className="px-5 py-3 rounded-xl border-2 border-foreground/20 text-foreground font-display font-700 text-sm uppercase tracking-wide hover:border-foreground/40 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go →"}
          </button>
        </div>

        {error && <p className="text-red-500 text-xs font-body">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Intersection header */}
          <div className="border-2 border-foreground bg-primary/5 rounded-2xl p-5">
            <p className="font-display font-900 text-2xl md:text-3xl uppercase tracking-tight mb-1">
              {result.blend}
            </p>
            <p className="font-body text-sm text-foreground/70 mb-3">
              {result.tagline}
            </p>
            <p className="font-display font-700 text-sm text-foreground italic border-l-4 border-primary pl-3">
              {result.story}
            </p>
          </div>

          {/* Role cards */}
          <div>
            <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-3">
              10 roles in this world
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.roles.map((role, i) => (
                <Link
                  key={i}
                  to={`/my-jobs?tab=search&q=${encodeURIComponent(role.title)}`}
                  className="group border-2 border-foreground/10 bg-background rounded-2xl p-4 flex flex-col gap-2 hover:bg-primary hover:border-foreground hover:-translate-y-0.5 transition-all"
                >
                  <p className="font-display font-900 text-sm leading-snug group-hover:text-foreground">
                    {role.title}
                  </p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed flex-1 group-hover:text-foreground/80">
                    {role.description}
                  </p>
                  <div className="flex items-center gap-1 pt-2 border-t border-foreground/10 group-hover:border-foreground/20">
                    <Search className="w-3 h-3 text-primary group-hover:text-foreground shrink-0" />
                    <span className="font-display font-700 text-[10px] uppercase tracking-wide text-primary group-hover:text-foreground">
                      Find jobs like this
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Try again */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSurprise}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border-2 border-foreground/20 text-foreground font-display font-700 text-xs uppercase tracking-wide hover:border-foreground/40 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" /> Try a different combination
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
