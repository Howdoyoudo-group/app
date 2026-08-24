import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import howdyMascot from "@/assets/howdy-mascot.png";

interface HowdyReadAloudProps {
  /** Path under /public, e.g. "/audio/howdy-start-blank-sheet.mp3" */
  src: string;
  label?: string;
}

/** Compact "Howdy reads this out loud" player for a static pre-recorded clip. */
const HowdyReadAloud = ({ src, label = "Listen to Howdy read this" }: HowdyReadAloudProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(Number.isNaN(pct) ? 0 : pct);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="inline-flex items-center gap-3 border-2 border-foreground rounded-full pl-1.5 pr-4 py-1.5 mb-5 bg-background">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <img src={howdyMascot} alt="Howdy" className="w-6 h-6 rounded-full shrink-0" />
      <div className="min-w-0">
        <p className="font-display font-700 text-xs uppercase tracking-wide text-foreground truncate">
          {label}
        </p>
        <div className="w-32 h-1 bg-border rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default HowdyReadAloud;
