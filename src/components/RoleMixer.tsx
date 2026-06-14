import { useState, useRef } from "react";
import { Shuffle, Loader2, Briefcase, Building2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const INDUSTRIES = [
  "Football", "Music", "Fashion", "Cinema & Film", "Gaming", "Journalism",
  "Farming", "Health", "Beer & Drinks", "Coffee", "Formula 1", "Jewellery",
  "Footwear", "Horse Racing", "Pets", "Money", "Charity", "Travel",
  "Interior Design", "Beauty", "Estate Agency", "Wellness", "Teaching",
  "Bakery", "Physiotherapy", "Cars", "Grocery", "Hospitality",
];

const SKILLS = ["Creative", "People", "Digital", "Practical"];

const SKILL_DESCRIPTIONS: Record<string, string> = {
  Creative: "design, storytelling, making things",
  People: "leadership, coaching, communication",
  Digital: "data, tech, analytics",
  Practical: "hands-on, craft, operations",
};

interface BlendResult {
  role: string;
  blend: string;
  description: string;
  why: string;
  example_companies: string[];
  search_query: string;
}

function SlotReel({ value, spinning, items, label }: {
  value: string;
  spinning: boolean;
  items: string[];
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="relative w-full h-16 bg-gray-900 border-2 border-[hsl(120,100%,45%)] rounded-xl overflow-hidden flex items-center justify-center">
        {spinning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 animate-spin-blur">
            {[...items].sort(() => Math.random() - 0.5).slice(0, 5).map((item, i) => (
              <div key={i} className="text-xs text-[hsl(120,100%,45%)] font-bold text-center leading-tight px-2">{item}</div>
            ))}
          </div>
        ) : (
          <span className="text-white font-bold text-sm text-center px-3 leading-tight">{value}</span>
        )}
        {/* scanline overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)"
        }} />
      </div>
    </div>
  );
}

export function RoleMixer({ userIndustries = [] }: { userIndustries?: string[] }) {
  const industries = userIndustries.length >= 2 ? userIndustries : INDUSTRIES;

  const [ind1, setInd1] = useState(industries[0] || "Football");
  const [ind2, setInd2] = useState(industries[1] || "Music");
  const [skill, setSkill] = useState(SKILLS[0]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<BlendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const spinTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSpin() {
    setSpinning(true);
    setResult(null);
    setError(null);

    // Pick random values
    const newInd1 = industries[Math.floor(Math.random() * industries.length)];
    let newInd2 = industries[Math.floor(Math.random() * industries.length)];
    while (newInd2 === newInd1) newInd2 = industries[Math.floor(Math.random() * industries.length)];
    const newSkill = SKILLS[Math.floor(Math.random() * SKILLS.length)];

    // Show spinning for 1.8s then land
    spinTimeout.current = setTimeout(async () => {
      setInd1(newInd1);
      setInd2(newInd2);
      setSkill(newSkill);
      setSpinning(false);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blend-roles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ industry1: newInd1, industry2: newInd2, skill: newSkill }),
        });
        if (!res.ok) throw new Error("Failed to get blend");
        const data = await res.json();
        setResult(data);
      } catch {
        setError("Couldn't generate a blend — try spinning again!");
      }
    }, 1800);
  }

  async function handleCustomBlend() {
    if (ind1 === ind2) {
      setError("Pick two different industries!");
      return;
    }
    setSpinning(false);
    setResult(null);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blend-roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ industry1: ind1, industry2: ind2, skill }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Couldn't generate a blend — try again!");
    }
  }

  const isLoading = spinning || (!result && !error && false);

  return (
    <div className="rounded-2xl border-2 border-dashed border-[hsl(120,100%,45%)] bg-[hsl(120,100%,45%,0.04)] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[hsl(120,100%,45%)] flex items-center justify-center flex-shrink-0">
          <Shuffle className="w-4 h-4 text-black" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">The Role Mixer</h3>
          <p className="text-xs text-gray-400">Spin the reels — find a job you never knew existed</p>
        </div>
      </div>

      {/* Slot reels */}
      <div className="flex gap-3 items-end">
        <SlotReel value={ind1} spinning={spinning} items={industries} label="Industry 1" />
        <div className="text-[hsl(120,100%,45%)] font-bold text-xl pb-4">×</div>
        <SlotReel value={ind2} spinning={spinning} items={industries} label="Industry 2" />
        <div className="text-[hsl(120,100%,45%)] font-bold text-xl pb-4">+</div>
        <SlotReel value={skill} spinning={spinning} items={SKILLS} label="Skill" />
      </div>

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={spinning || (!result === false && isLoading)}
        className="w-full py-3 rounded-xl bg-[hsl(120,100%,45%)] text-black font-bold text-sm hover:bg-[hsl(120,100%,38%)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {spinning ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Spinning…</>
        ) : (
          <><Shuffle className="w-4 h-4" /> Spin the Mixer</>
        )}
      </button>

      {/* Manual pick */}
      <details className="group">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-200 transition-colors list-none flex items-center gap-1">
          <span className="group-open:hidden">▶</span>
          <span className="hidden group-open:inline">▼</span>
          Or pick your own blend
        </summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Industry 1</label>
              <select value={ind1} onChange={(e) => setInd1(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-[hsl(120,100%,45%)]">
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Industry 2</label>
              <select value={ind2} onChange={(e) => setInd2(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-[hsl(120,100%,45%)]">
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Your skill type</label>
            <div className="flex gap-2 flex-wrap">
              {SKILLS.map((s) => (
                <button key={s} onClick={() => setSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    skill === s
                      ? "bg-[hsl(120,100%,45%)] text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}>
                  {s} <span className="opacity-60">· {SKILL_DESCRIPTIONS[s]}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCustomBlend}
            className="w-full py-2.5 rounded-xl border border-[hsl(120,100%,45%)] text-[hsl(120,100%,45%)] font-bold text-sm hover:bg-[hsl(120,100%,45%,0.1)] transition-colors">
            Blend these →
          </button>
        </div>
      </details>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {/* Result card */}
      {result && !spinning && (
        <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-5 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[hsl(120,100%,45%,0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Briefcase className="w-4 h-4 text-[hsl(120,100%,45%)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[hsl(120,100%,45%)] text-black text-xs font-bold mb-1.5">
                {result.blend}
              </div>
              <h4 className="text-white font-bold text-xl leading-tight">{result.role}</h4>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{result.description}</p>
          <p className="text-[hsl(120,100%,45%)] text-xs leading-relaxed italic">"{result.why}"</p>
          {result.example_companies?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 text-xs">{result.example_companies.join(" · ")}</span>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <a href={`/jobs?q=${encodeURIComponent(result.search_query || result.role)}`}
              className="flex-1 py-2.5 rounded-xl bg-[hsl(120,100%,45%)] text-black font-bold text-xs text-center hover:bg-[hsl(120,100%,38%)] transition-colors">
              Find these jobs →
            </a>
            <a href={`/explore`}
              className="px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-medium text-xs text-center hover:border-gray-400 transition-colors flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Explore
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
