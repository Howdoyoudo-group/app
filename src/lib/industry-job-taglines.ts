// Per-industry "Jobs" section headlines (puns) used on industry pages,
// mirroring the daily newsletter taglines.

const INDUSTRY_JOB_TAGLINES: Record<string, string> = {
  "bakery": "Oven ready jobs",
  "beauty": "Good looking jobs",
  "beer": "Jobs on tap today",
  "cars": "Jobs to get you motoring",
  "charity": "Good jobs for good people",
  "cinema": "Ready for a new starring role?",
  "film-tv": "Ready for a new starring role?",
  "film and tv": "Ready for a new starring role?",
  "ai": "Smart jobs for smart minds",
  "coffee": "What's brewing today?",
  "estate agency": "Ready to make your next move?",
  "estate-agency": "Ready to make your next move?",
  "fashion": "Jobs tailored for you",
  "food & drink": "Tasty roles served up for you",
  "food and drink": "Tasty roles served up for you",
  "food-drink": "Tasty roles served up for you",
  "hospitality": "Tasty roles served up for you",
  "football": "Kick off something new or fancy a transfer?",
  "footwear": "Step into your next role?",
  "formula-1": "Find your pole position",
  "gaming": "Enter a new level",
  "grocery": "A basket of jobs for you",
  "influencing": "Find your most influential role yet",
  "interior design": "Well designed jobs, with real style",
  "interior-design": "Well designed jobs, with real style",
  "jewellery": "Jobs worth their weight in gold",
  "journalism": "Hold the front page, have we got jobs for you…",
  "music": "Find your next gig…",
  "pets": "Unleash your next role",
  "physiotherapy": "Hands on roles that make a difference…",
  "psychotherapy": "Jobs to get you thinking…",
  "teaching": "Top of the class jobs…",
  "travel": "Ready to start a new journey?",
  "wellness": "A healthy selection of new jobs…",
  "farming": "The best of the crop",
  "money": "Jobs you can count on",
  "health": "Look what the Doctor ordered",
  "horse racing": "Be first past the post",
  "horse-racing": "Be first past the post",
};

export function getIndustryJobTagline(industry: string): string {
  const key = (industry || "").toLowerCase().trim();
  if (INDUSTRY_JOB_TAGLINES[key]) return INDUSTRY_JOB_TAGLINES[key];
  const variants = [
    key.replace(/-/g, " "),
    key.replace(/-/g, " & "),
    key.replace(/-/g, " and "),
    key.replace(/\s+/g, "-"),
    key.replace(/\s*&\s*/g, "-"),
    key.replace(/\s+and\s+/g, "-"),
  ];
  for (const v of variants) {
    if (INDUSTRY_JOB_TAGLINES[v]) return INDUSTRY_JOB_TAGLINES[v];
  }
  return "Job Marketplace";
}
