export interface PressFeature {
  /** Outlet name as displayed, e.g. "THE TIMES" */
  outlet: string;
  /** Direct link to the piece */
  url: string;
  /** The article's own headline */
  headline: string;
  /** A short pull-quote or excerpt used as the teaser */
  excerpt: string;
}

// Real press mentions - each renders as a "Howdoyoudo? x <outlet>" lockup
// plus a linked teaser card in About.tsx's "Featured In" section. Add new
// entries here (newest first) rather than editing About.tsx directly.
export const pressFeatures: PressFeature[] = [
  {
    outlet: "THE TIMES",
    url: "https://www.thetimes.com/article/04eda571-7c20-45ce-8def-2d4c7c2b925c?shareToken=60f4906b6d029d5657024a6df8cf861f",
    headline: "We need to teach young people the new ways of getting a job",
    excerpt:
      "We have listened to people across the UK and US, and the message is the same. There is no shortage of ambition or interest. This is not a generation that doesn't want to work. What is missing is the bridge between “I love this” and “I could work in this”, and “how do I get help?”.",
  },
];
