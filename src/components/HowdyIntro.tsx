import howdyMascot from "@/assets/howdy-mascot.png";
import { cn } from "@/lib/utils";

interface HowdyIntroProps {
  /** Short kicker shown above the message. */
  eyebrow?: string;
  /** 2-3 sentence orientation copy, kept as plain text on purpose. */
  children: string;
  /** "compact" for use inside an existing tab layout (e.g. a Skills sub-tab). */
  size?: "default" | "compact";
  className?: string;
}

/** Static welcome/orientation card - no state, no AI call, just a friendly framing block. */
const HowdyIntro = ({ eyebrow = "Howdy says", children, size = "default", className }: HowdyIntroProps) => (
  <div
    className={cn(
      "flex items-start gap-4 border-2 border-foreground rounded-2xl bg-primary/5 p-5 md:p-6",
      size === "compact" && "p-4 md:p-4",
      className
    )}
  >
    <img
      src={howdyMascot}
      alt="Howdy"
      className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-foreground shrink-0 object-cover"
    />
    <div className="min-w-0">
      <p className="font-display font-700 text-[11px] uppercase tracking-widest text-primary mb-1">{eyebrow}</p>
      <p className="font-body text-sm md:text-base text-foreground/90 leading-relaxed">{children}</p>
    </div>
  </div>
);

export default HowdyIntro;
