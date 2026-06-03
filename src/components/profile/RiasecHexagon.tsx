import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { RiasecScores } from "@/components/RiasecQuiz";
import { supabase } from "@/integrations/supabase/client";

const TYPES: {
  key: keyof RiasecScores;
  label: string;
  short: string;
  color: string;
  vibe: string;
}[] = [
  { key: "R", label: "Realistic", short: "R", color: "#F97316", vibe: "Doer" },
  { key: "I", label: "Investigative", short: "I", color: "#3B82F6", vibe: "Thinker" },
  { key: "A", label: "Artistic", short: "A", color: "#EC4899", vibe: "Creator" },
  { key: "S", label: "Social", short: "S", color: "#10B981", vibe: "Helper" },
  { key: "E", label: "Enterprising", short: "E", color: "#FACC15", vibe: "Persuader" },
  { key: "C", label: "Conventional", short: "C", color: "#8B5CF6", vibe: "Organiser" },
];

interface Props {
  scores: RiasecScores;
}

const RiasecHexagon = ({ scores }: Props) => {
  const max = Math.max(...Object.values(scores), 1);
  const top = TYPES
    .map((t) => ({ ...t, value: scores[t.key] }))
    .sort((a, b) => b.value - a.value);
  const code = top.slice(0, 3).map((t) => t.short).join("");

  const [blurb, setBlurb] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code || code.length !== 3) return;
    const cacheKey = `riasec-blurb:${code}`;
    const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cached) { setBlurb(cached); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("explain-riasec", { body: { code } });
        if (cancelled) return;
        if (!error && data?.blurb) {
          setBlurb(data.blurb);
          try { localStorage.setItem(cacheKey, data.blurb); } catch {}
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);


  // Build hexagon polygon
  const cx = 110;
  const cy = 110;
  const radius = 90;
  const points = TYPES.map((_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
  const valuePoints = TYPES.map((t, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const r = (scores[t.key] / 100) * radius;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5 items-center">
      <div className="relative mx-auto">
        <svg viewBox="0 0 220 220" className="w-[220px] h-[220px]">
          {/* Background rings */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <polygon
              key={i}
              points={TYPES.map((_, idx) => {
                const angle = (Math.PI / 3) * idx - Math.PI / 2;
                return `${cx + Math.cos(angle) * radius * scale},${cy + Math.sin(angle) * radius * scale}`;
              }).join(" ")}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          ))}
          {/* Spokes */}
          {points.map(([x, y], i) => (
            <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth="1" />
          ))}
          {/* Value polygon */}
          <polygon
            points={valuePoints.map((p) => p.join(",")).join(" ")}
            fill="hsl(var(--primary) / 0.25)"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Vertex dots + labels */}
          {TYPES.map((t, i) => {
            const [x, y] = points[i];
            return (
              <g key={t.key}>
                <circle cx={x} cy={y} r="14" fill={t.color} stroke="hsl(var(--background))" strokeWidth="2" />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="800"
                  fill="white"
                  fontFamily="ui-sans-serif, system-ui"
                >
                  {t.short}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div>
        <p className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary">
          Your RIASEC code
        </p>
        <p className="font-display font-800 text-4xl text-foreground leading-none mb-1">
          {code}
        </p>
        <p className="font-body text-[11px] text-muted-foreground mb-2">
          {top[0].label} · {top[1].label} · {top[2].label}
        </p>
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 mb-4">
          {loading && !blurb ? (
            <p className="font-body text-xs text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Reading your code…
            </p>
          ) : blurb ? (
            <p className="font-body text-xs text-foreground leading-relaxed">
              <Sparkles className="inline w-3 h-3 text-primary mr-1 -mt-0.5" />
              {blurb}
            </p>
          ) : (
            <p className="font-body text-xs text-muted-foreground">
              RIASEC is a career-personality model with six types (Realistic, Investigative, Artistic, Social, Enterprising, Conventional). Your top three letters are your blend.
            </p>
          )}
        </div>

        <ul className="space-y-1.5">
          {top.map((t) => (
            <li key={t.key} className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full font-display font-800 text-[11px] text-white flex-shrink-0"
                style={{ background: t.color }}
              >
                {t.short}
              </span>
              <span className="font-display font-600 text-xs text-foreground w-24 flex-shrink-0">
                {t.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${t.value}%`, background: t.color }}
                />
              </div>
              <span className="font-display font-700 text-[11px] text-foreground w-8 text-right">
                {Math.round(t.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RiasecHexagon;
