import howdy from "@/assets/howdy-mascot.png";
import { motion, AnimatePresence } from "framer-motion";

// Lines from docs/howdy-script.md §3 - keep in sync.
const LINES: Record<string, string> = {
  personal: "Hey, I'm Howdy - your AI sidekick around here. Think of me as the knowledgeable older sibling who's already done the legwork. I'll guide you through building your profile, then I'll keep an eye out for jobs, news and videos that actually suit you. Let's start with the basics.",
  photo: "Pop a photo in if you'd like employers to see a face. Totally optional - skip it if you'd rather stay faceless.",
  passions: "Pick the things you actually love outside work - bakeries, F1, gaming, whatever. This tells me more than a CV ever will.",
  interests: "Which industries pique your interest? Tap as many as you fancy - I'll pull jobs and briefings from each.",
  roles: "Any roles you're already drawn to? Don't overthink it - you can change your mind anytime.",
  wanted: "Got dream companies or dream roles? Drop them in. I'll keep an eye out for openings.",
  story: "Tell me your story in your own words. A short intro and what you're after - I'll use it to match you better.",
  skills: "What are you actually good at? Pick the tags that fit - practical, people, creative, digital.",
  experiences: "Add the things you've done - projects, jobs, side hustles. Anything you'd want me to mention to an employer.",
  prompts: "A few quick prompts. One sentence answers are perfect.",
  video: "A 30-second video intro lifts you above 90% of CVs. Optional, but worth it.",
  cv: "Drop your CV in now if you've got one - I'll read it once and use it to pre-fill your experience and education later. Skip if you'd rather build your profile from scratch.",
  education: "Where did you study and what did you come away with? Skip if it's not relevant.",
  linkedin: "Paste your LinkedIn URL or upload a screenshot - I'll fill in the gaps for you.",
  personality: "Six quick questions. Tells me whether you're more 'build it', 'sell it' or 'figure it out'.",
};

interface Props {
  stepId: string;
}

export default function HowdyCoach({ stepId }: Props) {
  const line = LINES[stepId] || "I'm right here if you need me.";
  return (
    <div className="mb-6 flex items-start gap-3 md:gap-4">
      <img
        src={howdy}
        alt="Howdy"
        className="h-14 w-14 md:h-16 md:w-16 shrink-0 object-contain"
      />
      <div className="relative flex-1 rounded-2xl border-2 border-foreground bg-background px-4 py-3 shadow-[3px_3px_0_hsl(var(--foreground))]">
        <span className="absolute -left-2 top-5 h-3 w-3 rotate-45 border-b-2 border-l-2 border-foreground bg-background" />
        <AnimatePresence mode="wait">
          <motion.p
            key={stepId}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-sm md:text-[15px] leading-snug text-foreground"
          >
            <span className="font-display text-xs font-700 uppercase tracking-wider text-primary mr-2">Howdy</span>
            {line}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
