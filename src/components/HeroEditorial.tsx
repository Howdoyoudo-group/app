import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Play, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { INDUSTRIES } from "@/data/industries";
import IndustryDoodle from "@/components/feed/IndustryDoodle";
import collageStadium from "@/assets/home-v2/collage-stadium.jpg";
import collageFashion from "@/assets/home-v2/collage-fashion.jpg";
import collageMusic from "@/assets/home-v2/collage-music.jpg";
import collageCinema from "@/assets/home-v2/collage-cinema.jpg";
import collageHospitality from "@/assets/home-v2/collage-hospitality.jpg";
// Full-bleed hand-drawn industry doodles backdrop (from original home)
import heroBg from "@/assets/hero-bg-industries.jpg";

/* Subtle film-grain overlay (SVG noise turbulence) */
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const LIME = "hsl(120, 100%, 45%)";

/* ---------- Hand-drawn primitives ---------- */

const ScribbleCircle = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 90"
    className={`absolute pointer-events-none ${className}`}
    aria-hidden="true"
    fill="none"
  >
    <path
      d="M40,45 C40,18 80,8 120,10 C165,12 188,30 188,50 C188,72 150,82 105,80 C55,78 18,68 14,46 C12,28 35,16 70,14"
      stroke={LIME}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const ScribbleUnderline = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 16"
    preserveAspectRatio="none"
    className={`absolute pointer-events-none ${className}`}
    aria-hidden="true"
    fill="none"
  >
    <path
      d="M3,9 C40,4 80,12 120,7 C150,3 180,11 197,6"
      stroke={LIME}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M10,13 C50,9 95,15 140,10 C170,8 185,13 195,11"
      stroke={LIME}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

const ScribbleArrow = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 120 80"
    className={`absolute pointer-events-none ${className}`}
    aria-hidden="true"
    fill="none"
  >
    <path
      d="M10,15 C30,10 50,40 60,55 C70,68 85,72 100,65"
      stroke={LIME}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M88,58 L100,65 L92,75"
      stroke={LIME}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkleMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={`absolute pointer-events-none ${className}`} aria-hidden="true" fill="none">
    <path d="M20,4 L20,16 M4,20 L16,20 M30,8 L24,14 M30,32 L24,26" stroke={LIME} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CrownDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 60" className={`absolute pointer-events-none ${className}`} aria-hidden="true" fill="none">
    <path
      d="M8,45 L14,18 L26,35 L40,12 L54,35 L66,18 L72,45 Z"
      stroke={LIME}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="14" r="2.5" fill={LIME} />
    <circle cx="40" cy="8" r="2.5" fill={LIME} />
    <circle cx="66" cy="14" r="2.5" fill={LIME} />
  </svg>
);

/* Hand-drawn green pill CTA */
const PillCta = ({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) => (
  <span className="relative inline-flex items-center">
    <svg
      viewBox="0 0 220 64"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <path
        d="M32,4 C16,4 4,18 4,32 C4,47 16,60 32,60 L188,60 C204,60 216,47 216,32 C217,17 204,4 188,4 Z"
        fill={variant === "primary" ? LIME : "transparent"}
        stroke="hsl(0, 0%, 7%)"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span className="relative font-display font-900 text-sm md:text-base tracking-wide px-8 py-3.5 inline-flex items-center gap-2.5 whitespace-nowrap text-foreground">
      {children}
    </span>
  </span>
);

/* Taped note card (paper with tape) */
const TapedNote = ({
  children,
  rotate = -2,
  className = "",
  tapeOffset = "left",
}: {
  children: React.ReactNode;
  rotate?: number;
  className?: string;
  tapeOffset?: "left" | "center" | "right";
}) => {
  const tapeLeft = tapeOffset === "left" ? "20%" : tapeOffset === "right" ? "70%" : "45%";
  return (
    <div
      className={`relative bg-[#f5efe2] border-2 border-foreground/10 px-5 py-4 shadow-[6px_6px_0_0_hsl(var(--foreground)/0.08)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="absolute -top-3 w-16 h-6 bg-foreground/70 opacity-80"
        style={{ left: tapeLeft, transform: "rotate(-4deg)" }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
};

/* Photo polaroid with film-grain overlay and tape */
const PhotoTile = ({
  src,
  alt,
  rotate = 0,
  tapeOffset = "center",
  aspect = "aspect-square",
  className = "",
}: {
  src: string;
  alt: string;
  rotate?: number;
  tapeOffset?: "left" | "center" | "right";
  aspect?: string;
  className?: string;
}) => {
  const tapeLeft =
    tapeOffset === "left" ? "18%" : tapeOffset === "right" ? "70%" : "42%";
  return (
    <div
      className={`relative bg-[#f5efe2] p-2 pb-3 shadow-[8px_8px_0_0_hsl(var(--foreground)/0.12)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="absolute -top-3 w-14 h-5 bg-foreground/55 z-10"
        style={{ left: tapeLeft, transform: "rotate(-5deg)" }}
        aria-hidden="true"
      />
      <div className={`relative overflow-hidden ${aspect}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="block w-full h-full object-cover sepia-[0.12] contrast-[1.05] saturate-[0.92]"
        />
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-70"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "240px 240px" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_55%,_rgba(0,0,0,0.35)_100%)]" />
      </div>
    </div>
  );
};

/* ---------- Cover stories ---------- */

const COVER_STORIES: Record<string, string> = {
  football: "Billions in broadcast deals, grassroots clubs on the brink, and the business empire behind the beautiful game.",
  coffee: "Cult brands, bean traders, and the $500 billion industry in your morning cup.",
  fashion: "Global supply chains, fast-fashion empires, and the people stitching it all together.",
  gaming: "Studios, esports, streamers, and the £7 billion UK industry behind the games we play.",
  "estate-agency": "Valuations, viewings, negotiations, and the people behind every 'Sold' sign on the high street.",
  teaching: "From classrooms to curricula, teacher training to EdTech - the people shaping how we learn.",
  music: "Tiny promoters, giant corporations, and the invisible machinery behind live music.",
  cinema: "From multi-billion dollar studios to indie darlings - how the film industry really works.",
  hospitality: "Restaurants, bars, breweries - how the food and drink industry really runs.",
  influencing: "Creators, agencies, platforms, and the booming creator economy - from TikTok to Substack.",
};

const weekOfYear = (d: Date) => {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diff = (d.getTime() - start.getTime()) / 86400000;
  return Math.floor((diff + start.getUTCDay()) / 7);
};

const HeroEditorial = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || null;

  const { featured, quickPicks } = useMemo(() => {
    const slugs = Object.keys(COVER_STORIES);
    const featuredSlug = slugs[weekOfYear(new Date()) % slugs.length] || "football";
    const featuredIndustry = INDUSTRIES.find((i) => i.slug === featuredSlug) || INDUSTRIES[0];
    const picks = ["football", "fashion", "cinema", "music", "hospitality"]
      .map((s) => INDUSTRIES.find((i) => i.slug === s))
      .filter(Boolean) as typeof INDUSTRIES;
    return {
      featured: { ...featuredIndustry, story: COVER_STORIES[featuredSlug] },
      quickPicks: picks,
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Preview ribbon - never on live / */}
      <div className="absolute top-3 right-3 z-50 select-none pointer-events-none">
        <span className="inline-block bg-foreground text-background font-body font-700 text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 border-2 border-foreground">
          Preview · /home-v2
        </span>
      </div>

      {/* Full-bleed hand-drawn industry doodles watermark */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-15 md:opacity-20"
        />
      </div>

      {/* Scattered watermark doodles to fill white space */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 md:opacity-40">
        <SparkleMark className="top-[8%] left-[6%] w-10 h-10" />
        <ScribbleCircle className="top-[14%] left-[42%] w-24 h-14 hidden md:block" />
        <CrownDoodle className="top-[28%] left-[2%] w-14 h-10 hidden md:block" />
        <ScribbleArrow className="top-[48%] left-[44%] w-20 h-14 hidden lg:block rotate-12" />
        <SparkleMark className="top-[62%] left-[8%] w-8 h-8" />
        <ScribbleUnderline className="top-[72%] left-[4%] w-40 h-3 hidden md:block" />
        <CrownDoodle className="bottom-[6%] left-[30%] w-16 h-12 hidden md:block -rotate-12" />
        <SparkleMark className="bottom-[10%] left-[48%] w-10 h-10 hidden md:block" />
        <ScribbleCircle className="bottom-[18%] right-[2%] w-24 h-14 hidden lg:block" />
        <SparkleMark className="top-[4%] right-[18%] w-8 h-8 hidden md:block" />
        <ScribbleArrow className="bottom-[34%] right-[-1%] w-20 h-14 hidden lg:block -scale-x-100" />
      </div>

      <div className="container mx-auto px-5 md:px-10 lg:px-14 pt-2 md:pt-4 pb-16 md:pb-24">
        <p className="font-display font-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-2 md:mb-3 leading-tight break-words">
          Howdoyoudo<span className="text-primary">?</span>
          {firstName && (
            <>
              {" "}
              <span className="relative inline-block">
                {firstName}
                <ScribbleUnderline className="left-0 -bottom-1 w-full h-2.5" />
              </span>
            </>
          )}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* ============ LEFT - HEADLINE ============ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-6 relative pt-4 md:pt-8 text-4xl"
          >


            <h1 className="font-display font-900 leading-[0.95] tracking-tight sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl text-foreground text-4xl">
              Unpacking
              <br />
              the industries
              <br />
              you already{" "}
              <span className="relative inline-block">
                live
                <ScribbleCircle className="-top-3 -left-4 w-[140%] h-[160%]" />
              </span>
              <br />
              inside<span className="text-primary">.</span>
            </h1>

            {/* CTAs */}
            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-5 md:gap-7">
              <Link to="#series" className="hover:opacity-90 transition-opacity">
                <PillCta>
                  Explore industries
                  <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </PillCta>
              </Link>

            </div>

            {/* Social proof */}
            <div className="mt-10 md:mt-14 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["bg-amber-200", "bg-rose-200", "bg-sky-200", "bg-emerald-200"].map((c, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full border-2 border-background ${c}`}
                    aria-hidden="true"
                  />
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-background bg-foreground text-background flex items-center justify-center">
                  <Plus className="w-4 h-4" strokeWidth={3} />
                </div>
              </div>
              <p className="font-body text-sm text-foreground/70 leading-tight max-w-[14rem] relative">
                <span className="font-700 text-foreground">Join the community</span> learning how the
                world actually works.
                <ScribbleUnderline className="left-0 -bottom-1 w-32 h-2" />
              </p>
            </div>
          </motion.div>

          {/* ============ RIGHT - COLLAGE ============ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="md:col-span-6 relative min-h-[520px] md:min-h-[640px]"
          >
            {/* Sparkle + crown decoration */}
            <SparkleMark className="top-2 left-4 w-8 h-8" />
            <CrownDoodle className="top-4 right-2 w-16 h-12" />


            {/* Collage grid - grainy taped photos */}
            <div className="absolute inset-0 grid grid-cols-2 gap-5 md:gap-7 pt-8 md:pt-10 pb-28">
              <div className="space-y-5 md:space-y-7 pt-10">
                <Link to="/football" className="block">
                  <PhotoTile
                    src={collageStadium}
                    alt="Football stadium at golden hour"
                    rotate={-3}
                    tapeOffset="center"
                    aspect="aspect-[4/5]"
                  />
                </Link>
                <Link to="/hospitality" className="block">
                  <PhotoTile
                    src={collageHospitality}
                    alt="Chef plating in a restaurant kitchen"
                    rotate={2.5}
                    tapeOffset="left"
                  />
                </Link>
              </div>
              <div className="space-y-5 md:space-y-7">
                <Link to="/cinema" className="block">
                  <PhotoTile
                    src={collageCinema}
                    alt="Film crew reviewing a shot on monitor"
                    rotate={3}
                    tapeOffset="right"
                  />
                </Link>
                <Link to="/fashion" className="block">
                  <PhotoTile
                    src={collageFashion}
                    alt="Fashion designer sketching at desk"
                    rotate={-2}
                    tapeOffset="center"
                    aspect="aspect-[4/5]"
                  />
                </Link>
                <Link to="/music" className="block">
                  <PhotoTile
                    src={collageMusic}
                    alt="Music producer at studio console"
                    rotate={4}
                    tapeOffset="left"
                  />
                </Link>
              </div>
            </div>

            {/* Curved arrow pointing into collage */}
            <ScribbleArrow className="top-[42%] left-[-2%] w-24 h-16 hidden md:block" />

          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HeroEditorial;
