import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroBg from "@/assets/hero-bg-industries.jpg";

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
    <span className="group relative inline-block font-body font-600 text-sm tracking-wide text-background hover:text-primary transition-colors">
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
        stroke="hsl(0, 0%, 100%)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span
      className={`relative font-display font-600 text-xs tracking-wide uppercase px-6 py-2.5 whitespace-nowrap ${
        variant === "primary" ? "text-foreground" : "text-background"
      }`}
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
    style={{ filter: "brightness(0) invert(1)" }}
  />
);

const Hero = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || null;

  return (
    <section
      className="relative min-h-screen flex items-stretch overflow-hidden bg-primary"
    >
      {/* Full-bleed hand-drawn industry doodles backdrop */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-25 md:opacity-30 mix-blend-screen"
        />
      </div>

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {/* ============ Scattered industry doodles ============ */}
      <FloatingDoodle
        src={doodleWhisk}
        alt=""
        delay={0.2}
        rotate={-12}
        className="hidden md:block top-28 right-[8%] w-28 opacity-50"
      />
      <FloatingDoodle
        src={doodleSneaker}
        alt=""
        delay={0.35}
        rotate={8}
        className="hidden md:block top-44 right-[22%] w-32 opacity-45"
      />
      <FloatingDoodle
        src={doodleCake}
        alt=""
        delay={0.5}
        rotate={-6}
        className="hidden md:block top-1/2 right-[6%] w-36 opacity-50"
      />
      <FloatingDoodle
        src={doodleBoot}
        alt=""
        delay={0.4}
        rotate={14}
        className="hidden md:block bottom-44 right-[18%] w-28 opacity-45"
      />
      <FloatingDoodle
        src={doodleDonut}
        alt=""
        delay={0.55}
        rotate={-10}
        className="hidden md:block bottom-32 left-[8%] w-24 opacity-50"
      />
      <FloatingDoodle
        src={doodleLoafer}
        alt=""
        delay={0.45}
        rotate={6}
        className="hidden md:block top-40 left-[6%] w-28 opacity-40"
      />
      <FloatingDoodle
        src={doodlePretzel}
        alt=""
        delay={0.6}
        rotate={18}
        className="hidden md:block bottom-1/2 left-[3%] w-24 opacity-45"
      />
      <FloatingDoodle
        src={doodleSandal}
        alt=""
        delay={0.5}
        rotate={-14}
        className="hidden md:block top-1/3 left-[38%] w-20 opacity-40"
      />

      {/* Mobile: a couple of doodles only */}
      <FloatingDoodle
        src={doodleWhisk}
        alt=""
        delay={0.2}
        rotate={-12}
        className="md:hidden top-28 right-4 w-20 opacity-40"
      />
      <FloatingDoodle
        src={doodleSneaker}
        alt=""
        delay={0.4}
        rotate={10}
        className="md:hidden bottom-32 left-4 w-20 opacity-40"
      />

      {/* ============ TOP NAV - all CTAs live here ============ */}
      <nav className="absolute top-0 inset-x-0 z-30 px-5 md:px-10 py-5 md:py-7 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 md:gap-12">
          <Link
            to="/"
            className="font-display font-900 text-lg md:text-xl tracking-tight text-foreground whitespace-nowrap"
          >
            How do you do<span className="text-background">?</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            <NavLink href="#series">Industries</NavLink>
            <NavLink href="#roles">Roles</NavLink>
            <NavLink to="/marketplace">Jobs</NavLink>
            <NavLink to="/learning">Resources</NavLink>
            <NavLink href="#about">About</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            to="/employers"
            className="hidden sm:inline-block hover:opacity-90 transition-opacity"
          >
            <SketchCta variant="ghost">Employers</SketchCta>
          </Link>
          {user ? (
            <Link to="/my-jobs" className="hover:opacity-90 transition-opacity">
              <SketchCta>My Inbox</SketchCta>
            </Link>
          ) : (
            <Link
              to="/auth?next=/my-jobs"
              className="hover:opacity-90 transition-opacity"
            >
              <SketchCta>Sign In</SketchCta>
            </Link>
          )}
        </div>
      </nav>

      {/* ============ HERO BODY ============ */}
      <div className="relative z-10 container mx-auto px-5 md:px-12 pt-32 md:pt-40 pb-28 md:pb-24 flex flex-col justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display font-900 leading-[0.85] tracking-tight text-[4.25rem] sm:text-7xl md:text-[8.5rem] lg:text-[10rem] text-foreground">
            <span className="block">How do</span>
            <span className="block">
              you do<span className="text-background">?</span>
            </span>
            {firstName && (
              <span className="block text-background mt-1">{firstName}</span>
            )}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 md:mt-14 max-w-2xl"
        >
          <p className="font-body text-xl md:text-2xl leading-snug text-background/90">
            Unpacking the industries we love and live in.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
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
                <SketchCta>Start with About You</SketchCta>
              </Link>
            )}
            <a
              href="#series"
              className="group flex items-center gap-2 font-body font-600 text-sm uppercase tracking-widest text-background/70 hover:text-primary transition-colors"
            >
              <span>Explore the industries</span>
              <span className="inline-block group-hover:translate-x-1 transition-transform">
                ↓
              </span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* ============ Industry marquee - bottom edge ============ */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-foreground text-background border-t-2 border-foreground overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap py-2 font-display text-[11px] md:text-sm tracking-[0.2em] uppercase"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        >
          {Array(2)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex shrink-0">
                {[
                  "Bakery",
                  "Beauty",
                  "Beer",
                  "Cars",
                  "Charity",
                  "Film and TV",
                  "Coffee",
                  "Estate Agency",
                  "Fashion",
                  "Football",
                  "Footwear",
                  "Gaming",
                  "Grocery",
                  "Hospitality",
                  "Interior Design",
                  "Jewellery",
                  "Journalism",
                  "Music",
                  "Pets",
                  "Physiotherapy",
                  "Psychotherapy",
                  "Teaching",
                  "Travel",
                  "Wellness",
                ].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-3 px-4"
                  >
                    <span>★</span>
                    {label}
                  </span>
                ))}
              </div>
            ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
