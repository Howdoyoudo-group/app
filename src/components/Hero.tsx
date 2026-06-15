import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SiteHeader from "./SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRIES } from "@/data/industries";
import heroBg from "@/assets/hero-bg-industries.jpg";
import brandQuestionMark from "@/assets/brand/logo-question-mark.png";

// Hand-drawn industry doodles
import doodleWhisk from "@/assets/bakery-whisk.png";
import doodleCake from "@/assets/bakery-cake.png";
import doodleDonut from "@/assets/bakery-donut.png";
import doodlePretzel from "@/assets/bakery-pretzel.png";
import doodleSneaker from "@/assets/footwear-sneaker.png";
import doodleBoot from "@/assets/footwear-boot.png";
import doodleLoafer from "@/assets/footwear-loafer.png";
import doodleSandal from "@/assets/footwear-sandal.png";

/* Royal blue base - used in inline styles for SVG strokes/fills */
const ROYAL = "hsl(225, 75%, 22%)";
const LIME = "hsl(120, 100%, 45%)";

/* ---------- Sketched nav link with hand-drawn underline on hover ---------- */
const NavLink = ({
  to,
  href,
  children,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
}) => {
  const inner = (
    <span className="group relative inline-block font-display font-900 text-sm md:text-sm lg:text-base uppercase tracking-wide text-foreground hover:text-primary transition-colors whitespace-nowrap">
      {children}
      <svg
        className="absolute -bottom-1.5 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        viewBox="0 0 80 6"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M1 3 Q20 0 40 3 T79 3"
          stroke={LIME}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return <a href={href}>{inner}</a>;
};

/* ---------- Sketched CTA button - rounded hand-drawn pill ---------- */
const SketchCta = ({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) => (
  <span className="relative inline-flex items-center">
    <svg
      viewBox="0 0 160 52"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Wonky hand-drawn pill - rounded ends, slightly imperfect */}
      <path
        d="M26,3 C14,3 4,14 3,26 C3,38 13,49 26,49 L134,49 C147,49 157,38 157,26 C158,14 147,3 134,3 Z"
        fill={variant === "primary" ? LIME : "transparent"}
        stroke="hsl(0, 0%, 7%)"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span
      className={`relative font-display font-900 text-sm tracking-wide uppercase px-7 py-3 whitespace-nowrap text-foreground`}
    >
      {children}
    </span>
  </span>
);

/* ---------- Floating hand-drawn doodle ---------- */
const FloatingDoodle = ({
  src,
  alt,
  className,
  delay = 0,
  rotate = 0,
}: {
  src: string;
  alt: string;
  className: string;
  delay?: number;
  rotate?: number;
}) => (
  <motion.img
    src={src}
    alt={alt}
    aria-hidden="true"
    initial={{ opacity: 0, y: 20, rotate: rotate - 6 }}
    animate={{ opacity: 1, y: 0, rotate }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`absolute select-none pointer-events-none ${className}`}
  />
);

const Hero = () => {
  const { user, signOut } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [industryQuery, setIndustryQuery] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setPhotoUrl(null); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("photo_url")
        .eq("id", user.id)
        .maybeSingle();
      setPhotoUrl((data as any)?.photo_url || null);
    })();
  }, [user]);

  const filteredIndustries = useMemo(() => {
    const q = industryQuery.trim().toLowerCase();
    if (!q) return INDUSTRIES;
    return INDUSTRIES.filter((i) => i.name.toLowerCase().includes(q));
  }, [industryQuery]);

  // Close industry panel on Escape
  useEffect(() => {
    if (!industriesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndustriesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [industriesOpen]);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  return (
    <section
      className="relative min-h-screen flex items-stretch overflow-x-hidden bg-background w-full max-w-[100vw]"
    >
      {/* Full-bleed hand-drawn industry doodles backdrop */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-15 md:opacity-20"
        />
      </div>

      {/* Subtle vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.08) 100%)",
        }}
      />
      {/* ============ TOP NAV ============ */}
      <SiteHeader overlay />

      {/* ============ INDUSTRY SEARCH PANEL ============ */}
      <AnimatePresence>
        {industriesOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIndustriesOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Browse industries"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-20 md:top-24 inset-x-3 sm:inset-x-4 z-50 mx-auto w-auto max-w-[640px] max-h-[80vh] flex flex-col bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] overflow-hidden"
            >
              <div className="flex items-center gap-2 p-4 border-b-2 border-foreground">
                <Search size={20} strokeWidth={3} className="text-foreground/60 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={industryQuery}
                  onChange={(e) => setIndustryQuery(e.target.value)}
                  placeholder="Search industries…"
                  className="flex-1 bg-transparent outline-none font-body text-base md:text-lg text-foreground placeholder:text-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setIndustriesOpen(false)}
                  aria-label="Close"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-foreground bg-background text-foreground hover:bg-primary transition-colors shrink-0"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-3">
                {filteredIndustries.length === 0 ? (
                  <p className="p-6 text-center font-body text-foreground/60">
                    No industries match "{industryQuery}".
                  </p>
                ) : (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredIndustries.map((ind) => (
                      <li key={ind.slug}>
                        <Link
                          to={`/${ind.slug}`}
                          onClick={() => {
                            setIndustriesOpen(false);
                            setIndustryQuery("");
                          }}
                          className="block px-3 py-2.5 rounded-lg font-display font-900 text-sm uppercase tracking-wide text-foreground hover:bg-primary hover:text-foreground transition-colors border-2 border-transparent hover:border-foreground"
                        >
                          {ind.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-4 py-2 border-t-2 border-foreground bg-foreground/5 font-body text-xs text-foreground/60 text-center">
                {filteredIndustries.length} of {INDUSTRIES.length} industries
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ============ HERO BODY ============ */}
      <div className="relative z-10 container mx-auto px-5 md:px-12 pt-56 md:pt-32 pb-20 md:pb-24 grid lg:grid-cols-[minmax(0,1fr)_auto] gap-10 lg:gap-14 items-start lg:items-center min-h-screen w-full max-w-full">
        <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="self-center md:self-start text-center md:text-left w-full md:w-auto"
        >
          <div className="relative inline-block max-w-full">
            {/* Mobile: simple hand-drawn speech bubble (single wobbly outline, no frame) */}
            <svg
              className="md:hidden absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M300,14 C460,12 582,46 580,172 C582,262 540,310 458,324 L478,394 L410,326 C300,334 180,334 142,324 C60,310 18,262 20,172 C18,46 140,12 300,14 Z"
                fill="none"
                stroke="hsl(var(--foreground))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Desktop/tablet: full hand-drawn wobbly speech bubble - matches the picture-frame style */}
            <svg
              className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* White fill so text reads */}
              <path
                d="M300,14 C460,12 582,46 580,172 C582,262 540,310 458,324 L478,394 L410,326 C300,334 180,334 142,324 C60,310 18,262 20,172 C18,46 140,12 300,14 Z"
                fill="hsl(0, 0%, 100%)"
                stroke="none"
              />
              <g
                fill="none"
                stroke="hsl(var(--foreground))"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Outer rounded bubble */}
                <path d="M300,14 C460,12 582,46 580,172 C582,262 540,310 458,324 L478,394 L410,326 C300,334 180,334 142,324 C60,310 18,262 20,172 C18,46 140,12 300,14 Z" />
                {/* Inner rounded bubble (matte) */}
                <path d="M300,36 C440,34 558,64 556,172 C558,250 522,294 452,308 C448,318 444,326 440,332 C432,322 426,314 420,308 C300,316 184,316 148,308 C78,294 42,250 44,172 C42,64 160,34 300,36 Z" />

                {/* Decorative beading between the two bubbles (tiny dots, matching frame) */}
                <circle cx="120" cy="20" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="220" cy="14" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="320" cy="14" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="420" cy="16" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="510" cy="22" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="568" cy="100" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="578" cy="180" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="568" cy="260" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="120" cy="316" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="240" cy="324" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="350" cy="326" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="32" cy="120" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="22" cy="200" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="32" cy="270" r="2.5" fill="hsl(var(--foreground))" />

                {/* Top centre flourish (cartouche), echoing frame */}
                <path d="M280,12 Q295,-4 320,-2 Q345,-4 360,12" />
                <path d="M298,4 Q320,-2 342,4" />
                <circle cx="320" cy="2" r="3" fill="hsl(var(--primary))" />

                {/* Top-left corner curl */}
                <path d="M86,22 Q60,8 50,24 Q48,38 62,42 Q70,34 78,40" />
                <circle cx="56" cy="32" r="2.5" fill="hsl(var(--primary))" />

                {/* Top-right corner curl */}
                <path d="M506,24 Q536,10 548,28 Q550,42 536,46 Q528,38 520,42" />
                <circle cx="544" cy="36" r="2.5" fill="hsl(var(--primary))" />

                {/* Bottom-left corner curl */}
                <path d="M60,308 Q34,322 28,338 Q34,352 50,348 Q54,338 62,340" />
                <circle cx="40" cy="334" r="2.5" fill="hsl(var(--primary))" />

                {/* Tail tip flourish - small bead on the point */}
                <circle cx="478" cy="394" r="3" fill="hsl(var(--primary))" />
              </g>
            </svg>
            <h1 className="relative z-10 font-display font-900 leading-[0.9] tracking-tight text-foreground pl-8 sm:pl-12 md:pl-16 pr-12 sm:pr-14 md:pr-20 pt-16 sm:pt-14 md:pt-16 pb-28 sm:pb-28 md:pb-36 inline-block max-w-full">
              <span className="block text-[15vw] sm:text-5xl md:text-7xl lg:text-8xl whitespace-nowrap">How do</span>
              <span className="block text-[15vw] sm:text-5xl md:text-7xl lg:text-8xl whitespace-nowrap">
                you do
                <img
                  src={brandQuestionMark}
                  alt="?"
                  className="inline-block align-baseline ml-1 h-[1em] w-auto translate-y-[0.15em]"
                />
              </span>
            </h1>
          </div>
          {firstName && (
            <div className="relative -mt-2 md:-mt-4 ml-[10%] sm:ml-[45%] md:ml-[50%] flex items-start gap-2 sm:gap-3 max-w-full pr-2">
              {/* Doodle arrow connecting bubble tail → name */}
              <svg
                className="w-8 sm:w-12 md:w-16 h-6 sm:h-8 md:h-10 -mt-4 sm:-mt-6 md:-mt-8 shrink-0"
                viewBox="0 0 80 40"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4,4 Q20,18 38,22 Q56,26 74,30"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M74,30 L66,24 M74,30 L66,34"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <p className="font-display font-900 leading-[0.9] tracking-tight text-primary text-[14vw] sm:text-6xl md:text-7xl break-words min-w-0 flex-1 md:whitespace-nowrap">
                {firstName}
              </p>
            </div>
          )}
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-12 md:mt-12 max-w-none"
        >
          <p className="font-display font-900 sm:text-2xl md:text-4xl leading-tight text-foreground text-2xl text-left">
            Start with what you <span style={{ color: LIME }}>love.</span> And see where it takes you.
          </p>

          <div className="mt-5 md:mt-8 flex flex-nowrap items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {user ? (
              <Link
                to="/my-profile"
                className="hover:opacity-90 transition-opacity"
              >
                <SketchCta>About You</SketchCta>
              </Link>
            ) : (
              <Link
                to="/auth?next=/onboarding"
                className="hover:opacity-90 transition-opacity"
              >
                <SketchCta>About You</SketchCta>
              </Link>
            )}
            <a href="#about" className="hover:opacity-90 transition-opacity">
              <SketchCta variant="ghost">About Us</SketchCta>
            </a>
          </div>

        </motion.div>
        </div>

        {/* Promo video - desktop only, right of the wordmark */}
        <motion.aside
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block shrink-0 w-[420px] xl:w-[520px] 2xl:w-[600px]"
          aria-label="Howdoyoudo? promo"
        >
          <div className="relative aspect-[16/10] bg-transparent">
            {/* Hand-drawn ornate picture frame */}
            <svg
              className="absolute -inset-6 lg:-inset-8 w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] h-[calc(100%+3rem)] lg:h-[calc(100%+4rem)] pointer-events-none z-10"
              viewBox="0 0 660 435"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* White matte fill - same white as the speech bubble (between outer & inner rect, evenodd ring) */}
              <path
                fillRule="evenodd"
                fill="hsl(var(--background))"
                stroke="none"
                d="M30,30 Q180,24 330,28 Q480,32 630,30 Q636,140 632,217 Q636,294 630,405 Q480,407 330,405 Q180,403 30,407 Q24,294 28,217 Q24,140 30,30 Z M50,50 Q180,46 330,48 Q480,50 610,52 Q612,140 610,217 Q612,294 610,385 Q480,387 330,385 Q180,383 50,387 Q48,294 50,217 Q48,140 50,50 Z"
              />
              <g
                fill="none"
                stroke="hsl(var(--foreground))"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Outer wobbly rectangle */}
                <path d="M30,30 Q180,24 330,28 Q480,32 630,30 Q636,140 632,217 Q636,294 630,405 Q480,407 330,405 Q180,403 30,407 Q24,294 28,217 Q24,140 30,30 Z" />
                {/* Inner wobbly rectangle (the matte) */}
                <path d="M50,50 Q180,46 330,48 Q480,50 610,52 Q612,140 610,217 Q612,294 610,385 Q480,387 330,385 Q180,383 50,387 Q48,294 50,217 Q48,140 50,50 Z" />

                {/* Decorative beading between the two rectangles (tiny circles) */}
                <circle cx="60" cy="40" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="160" cy="38" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="260" cy="38" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="400" cy="38" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="500" cy="40" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="600" cy="40" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="60" cy="397" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="200" cy="397" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="340" cy="397" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="480" cy="397" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="600" cy="397" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="40" cy="120" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="40" cy="220" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="40" cy="320" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="620" cy="120" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="620" cy="220" r="2.5" fill="hsl(var(--foreground))" />
                <circle cx="620" cy="320" r="2.5" fill="hsl(var(--foreground))" />

                {/* === Top centre flourish (cartouche/shell) === */}
                <path d="M300,28 Q310,8 330,4 Q350,8 360,28" />
                <path d="M315,18 Q330,10 345,18" />
                <path d="M330,4 L330,16" />
                <circle cx="330" cy="20" r="3" fill="hsl(var(--primary))" />
                <path d="M285,30 Q295,22 308,28" />
                <path d="M352,28 Q365,22 375,30" />

                {/* === Bottom centre flourish === */}
                <path d="M300,407 Q310,425 330,430 Q350,425 360,407" />
                <path d="M315,420 Q330,427 345,420" />
                <circle cx="330" cy="418" r="3" fill="hsl(var(--primary))" />

                {/* === Top-left ornate corner - scroll/curl === */}
                <path d="M30,30 Q12,18 6,32 Q4,46 18,50 Q26,42 30,50" />
                <path d="M14,32 Q20,28 24,34" />
                <circle cx="10" cy="42" r="2.5" fill="hsl(var(--primary))" />
                <path d="M30,55 Q22,62 28,72 Q36,68 32,60" />

                {/* === Top-right ornate corner === */}
                <path d="M630,30 Q648,18 654,32 Q656,46 642,50 Q634,42 630,50" />
                <path d="M646,32 Q640,28 636,34" />
                <circle cx="650" cy="42" r="2.5" fill="hsl(var(--primary))" />
                <path d="M630,55 Q638,62 632,72 Q624,68 628,60" />

                {/* === Bottom-left ornate corner === */}
                <path d="M30,405 Q12,418 6,403 Q4,388 18,385 Q26,393 30,385" />
                <path d="M14,402 Q20,406 24,400" />
                <circle cx="10" cy="392" r="2.5" fill="hsl(var(--primary))" />
                <path d="M30,378 Q22,372 28,362 Q36,366 32,374" />

                {/* === Bottom-right ornate corner === */}
                <path d="M630,405 Q648,418 654,403 Q656,388 642,385 Q634,393 630,385" />
                <path d="M646,402 Q640,406 636,400" />
                <circle cx="650" cy="392" r="2.5" fill="hsl(var(--primary))" />
                <path d="M630,378 Q638,372 632,362 Q624,366 628,374" />

                {/* === Side mid-flourishes (small leaves) === */}
                <path d="M30,217 Q12,210 8,217 Q12,224 30,217" />
                <path d="M14,213 L18,221" />
                <path d="M630,217 Q648,210 652,217 Q648,224 630,217" />
                <path d="M642,213 L646,221" />

                {/* Hanging hook above frame */}
                <path d="M325,4 Q330,-4 335,4" />
              </g>
            </svg>
            <iframe
              src="https://www.youtube.com/embed/o0YUzxz4eSs?autoplay=1&mute=1&loop=1&playlist=o0YUzxz4eSs&controls=0&modestbranding=1&rel=0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-sm"
              style={{ border: 0 }}
            />
          </div>
        </motion.aside>
      </div>

      {/* ============ Industry marquee - bottom edge ============ */}
      <div className="group absolute bottom-0 inset-x-0 z-20 bg-primary text-foreground border-t-2 border-foreground overflow-hidden">
        <div
          className="flex whitespace-nowrap py-2 font-display text-[11px] md:text-sm tracking-[0.2em] uppercase animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]"
          style={{ width: "max-content" }}
        >
          {Array(2)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex shrink-0">
                {[
                  { label: "Bakery", slug: "bakery" },
                  { label: "Beauty", slug: "beauty" },
                  { label: "Beer", slug: "beer" },
                  { label: "Cars", slug: "cars" },
                  { label: "Charity", slug: "charity" },
                  { label: "Film and TV", slug: "cinema" },
                  { label: "Coffee", slug: "coffee" },
                  { label: "Estate Agency", slug: "estate-agency" },
                  { label: "Farming", slug: "farming" },
                  { label: "Fashion", slug: "fashion" },
                  { label: "Football", slug: "football" },
                  { label: "Footwear", slug: "footwear" },
                  { label: "Gaming", slug: "gaming" },
                  { label: "Grocery", slug: "grocery" },
                  { label: "Health", slug: "health" },
                  { label: "Horse Racing", slug: "horse-racing" },
                  { label: "Hospitality", slug: "hospitality" },
                  { label: "Interior Design", slug: "interior-design" },
                  { label: "Jewellery", slug: "jewellery" },
                  { label: "Journalism", slug: "journalism" },
                  { label: "Money", slug: "money" },
                  { label: "Music", slug: "music" },
                  { label: "Pets", slug: "pets" },
                  { label: "Physiotherapy", slug: "physiotherapy" },
                  { label: "Psychotherapy", slug: "psychotherapy" },
                  { label: "Teaching", slug: "teaching" },
                  { label: "Travel", slug: "travel" },
                  { label: "Wellness", slug: "wellness" },
                ].map(({ label, slug }) => (
                  <Link
                    key={label}
                    to={`/marketplace?industry=${slug}`}
                    className="relative z-10 inline-flex items-center gap-3 px-4 cursor-pointer hover:text-background hover:underline underline-offset-4 transition-colors"
                  >
                    <span>★</span>
                    {label}
                  </Link>
                ))}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
