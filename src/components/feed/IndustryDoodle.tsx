import {
  Croissant, Sparkles, Beer, Car, Heart, Clapperboard, Coffee,
  Home, Tractor, Shirt, Circle, Flag, Footprints, ShoppingCart,
  Activity, Medal, UtensilsCrossed, Sofa, Banknote, Music,
  Stethoscope, Brain, GraduationCap, Flower2, Gamepad2,
  Video, Gem, PawPrint, Plane, Dumbbell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <FootballIcon size={size} />
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
