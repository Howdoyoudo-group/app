import {
  Croissant, Sparkles, Beer, Car, Heart, Clapperboard, Coffee,
  Home, Tractor, Shirt, Circle, Flag, Footprints, ShoppingCart,
  Activity, Medal, UtensilsCrossed, Sofa, Banknote, Music,
  Stethoscope, Brain, GraduationCap, Flower2, Gamepad2,
  Video, Gem, PawPrint, Plane, Dumbbell, Package, Wrench, HardHat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Tennis racquet with ball */
const TennisIcon = ({ size = 24, ...props }: { size?: number; [k: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" fill="none" {...props}>
    {/* Racquet head - oval */}
    <ellipse cx="26" cy="22" rx="18" ry="20" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="4" />
    {/* Strings - vertical */}
    <line x1="18" y1="4" x2="18" y2="40" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="2" x2="26" y2="42" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="4" x2="34" y2="40" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    {/* Strings - horizontal */}
    <line x1="9" y1="15" x2="43" y2="15" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="22" x2="44" y2="22" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="29" x2="43" y2="29" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    {/* Handle */}
    <rect x="23" y="40" width="6" height="18" rx="3" fill="hsl(var(--foreground))" />
    {/* Grip wrap lines */}
    <line x1="23" y1="46" x2="29" y2="46" stroke="hsl(var(--background))" strokeWidth="1.5" />
    <line x1="23" y1="51" x2="29" y2="51" stroke="hsl(var(--background))" strokeWidth="1.5" />
    {/* Tennis ball */}
    <circle cx="50" cy="50" r="9" fill="hsl(var(--foreground))" />
    <path d="M43 46 Q50 52 57 46" stroke="hsl(var(--background))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M43 54 Q50 48 57 54" stroke="hsl(var(--background))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

/** Black-and-white football with filled panels */
const FootballIcon = ({ size = 24, ...props }: { size?: number; [k: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" {...props}>
    <circle cx="32" cy="32" r="29" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="4" />
    <polygon points="32,18 43,26 39,39 25,39 21,26" fill="hsl(var(--foreground))" />
    <path d="M32 18 31 5M43 26l13-4M39 39l8 12M25 39l-8 12M21 26 8 22" stroke="hsl(var(--foreground))" strokeWidth="4" strokeLinecap="round" />
    <path d="M31 5a29 29 0 0 1 25 17M47 51a29 29 0 0 1-30 0M8 22A29 29 0 0 1 31 5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const INDUSTRY_ICON: Record<string, LucideIcon> = {
  bakery: Croissant,
  beauty: Sparkles,
  beer: Beer,
  cars: Car,
  charity: Heart,
  cinema: Clapperboard,
  coffee: Coffee,
  "estate-agency": Home,
  farming: Tractor,
  fashion: Shirt,
  football: FootballIcon as any,
  "formula-1": Flag,
  footwear: Footprints,
  grocery: ShoppingCart,
  health: Activity,
  "horse-racing": Medal,
  hospitality: UtensilsCrossed,
  "interior-design": Sofa,
  money: Banknote,
  music: Music,
  physiotherapy: Stethoscope,
  psychotherapy: Brain,
  teaching: GraduationCap,
  wellness: Flower2,
  gaming: Gamepad2,
  influencing: Video,
  journalism: Gem,
  jewellery: Gem,
  pets: PawPrint,
  travel: Plane,
  fitness: Dumbbell,
  building: HardHat,
  fixing: Wrench,
  delivery: Package,
};

interface Props {
  industry: string;
  size?: number;
}

const IndustryDoodle = ({ industry, size = 40 }: Props) => {
  const slug = industry.toLowerCase().replace(/\s+/g, "-");
  const Icon = INDUSTRY_ICON[slug] || Circle;

  if (slug === "football") {
    return (
      <span className="inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <FootballIcon size={size} />
      </span>
    );
  }

  if (slug === "tennis") {
    return (
      <span className="inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <TennisIcon size={size} />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-foreground text-background shrink-0"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} strokeWidth={2.2} />
    </span>
  );
};

export default IndustryDoodle;
