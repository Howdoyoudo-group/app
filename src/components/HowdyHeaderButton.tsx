import { Link } from "react-router-dom";
import howdyMascot from "@/assets/howdy-mascot.png";

interface HowdyHeaderButtonProps {
  className?: string;
  /** Small notification dot - Howdy has something new to say. */
  showDot?: boolean;
}

/**
 * The round "open Howdy" button repeated, previously independently, at the
 * top of MyJobs, JobTracker and Community. One shared component so it stays
 * visually consistent and can carry a proactive-alert dot everywhere at once.
 */
export default function HowdyHeaderButton({ className = "", showDot = false }: HowdyHeaderButtonProps) {
  return (
    <Link
      to="/howdy"
      aria-label="Open Howdy"
      className={`relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-1 bg-[#00E600] ring-2 ring-foreground/10 hover:ring-foreground/30 transition overflow-hidden ${className}`}
    >
      <img src={howdyMascot} alt="" className="w-8 h-8 object-contain" />
      {showDot && (
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#FF3B30] ring-2 ring-background" aria-hidden />
      )}
    </Link>
  );
}
