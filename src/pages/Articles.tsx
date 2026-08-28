import { motion } from "framer-motion";
import { BookOpen, ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import jobToLoveCover from "@/assets/book-a-job-to-love.jpg";
import parachuteCover from "@/assets/book-what-color-is-your-parachute.jpg";
import eightyThousandHoursCover from "@/assets/book-80000-hours.jpg";
import howToStartCover from "@/assets/book-how-to-start.jpg";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

type Article = {
  title: string;
  source: string;
  description: string;
  url: string;
  tag: string;
  date?: string;
  image?: string;
};

const FEATURED_ARTICLES: Article[] = [
  {
    title: "A Job to Love",
    source: "The School of Life",
    description: "An insightful guide to finding meaningful work and building a career aligned with your values and passions. Explore what makes a job fulfilling and how to pursue it.",
    url: "https://www.theschooloflife.com/shop/a-job-to-love/",
    tag: "Career Philosophy",
    image: jobToLoveCover,
  },
  {
    title: "What Color Is Your Parachute?",
    source: "Richard N. Bolles",
    description: "The world's most popular career handbook, updated every year since 1970. A practical, step-by-step guide to figuring out what you want to do and actually landing it.",
    url: "https://www.parachutebook.com/",
    tag: "Career Philosophy",
    image: parachuteCover,
  },
  {
    title: "80,000 Hours",
    source: "Benjamin Todd",
    description: "Find a fulfilling career that does good. Ten years of research from the 80,000 Hours team on how to combine impact, meaning and personal fit when planning a career.",
    url: "https://80000hours.org/book/",
    tag: "Career Philosophy",
    image: eightyThousandHoursCover,
  },
  {
    title: "How to Start",
    source: "Jodi Kantor",
    description: "Discovering your life's work. The New York Times bestselling journalist behind the Weinstein investigation on the two principles - craft and need - that help you find and start meaningful work.",
    url: "https://jodikantor.com/how-to-start",
    tag: "Career Philosophy",
    image: howToStartCover,
  },
  {
    title: "Jimmy's Jobs of the Future",
    source: "Jimmy McLoughlin OBE",
    description: "The UK's most-trusted careers podcast - a former Downing Street business advisor interviews Prime Ministers, Chancellors and CEOs about work, with 110k+ listeners tuning in every month.",
    url: "https://www.jobsofthefuture.co",
    tag: "Podcast",
  },
  {
    title: "Max Klymenko",
    source: "@maxklymenko on YouTube",
    description: "Home of the viral \"Career Ladder\" series - guessing strangers' jobs in under two minutes. A brilliant, fast way to see just how many different careers actually exist.",
    url: "https://www.youtube.com/@maxklymenko/shorts",
    tag: "Video",
  },
  {
    title: "Feel like you can't get a job? You're not alone — but here's how to work around it",
    source: "The Conversation",
    description: "Automation now does the screening before a human ever looks at your application. Jason Walker breaks down five evidence-based strategies to navigate the modern job market — from optimising for AI to building a visible portfolio.",
    url: "https://theconversation.com/feel-like-you-cant-get-a-job-youre-not-alone-but-heres-how-to-work-around-it-268355",
    tag: "Careers",
    date: "Nov 2025",
  },
  {
    title: "Howdoyoudo? Newsletter",
    source: "Howdoyoudo? on Substack",
    description: "Stay updated with career insights, industry trends, and stories from the Howdoyoudo? team. Subscribe to our weekly newsletter for actionable advice and inspiration.",
    url: "https://substack.com/@hdydofficial",
    tag: "Newsletter",
  },
  {
    title: "BBC News",
    source: "BBC News",
    description: "A look at the changing world of work, careers and opportunities for young people.",
    url: "https://www.bbc.co.uk/news/articles/cd7pqwr5lqxo",
    tag: "Careers",
  },
];

export default function Articles() {
  return (
    <>
      <SEO
        title="Stuff We Rate | Howdoyoudo?"
        description="Read the best career stories, industry insight and advice from around the web — curated for young people."
      />

      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div {...fadeUp} className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-foreground/20 bg-background mb-4">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">Stuff We Rate</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground mb-4">
              Read & learn.
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl">
              The best career stories, industry insight and advice from around the web — curated for people figuring out what to do next.
            </p>
          </motion.div>

          {/* Articles */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <div className="space-y-4">
              {FEATURED_ARTICLES.map((article) => (
                <a
                  key={article.url}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col sm:flex-row gap-4 border-2 border-foreground rounded-2xl p-5 hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-shadow"
                >
                  {article.image && (
                    <div className="shrink-0 w-20 sm:w-16">
                      <img
                        src={article.image}
                        alt={`${article.title} cover`}
                        className="w-20 h-28 sm:w-16 sm:h-24 object-cover rounded-md border border-foreground/20 shadow-sm"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-display font-700 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary border border-foreground">
                        {article.tag}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">{article.source}</span>
                      {article.date && (
                        <span className="font-body text-xs text-muted-foreground">· {article.date}</span>
                      )}
                    </div>
                    <h2 className="font-display font-900 text-lg md:text-xl uppercase tracking-wide leading-tight mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {article.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center sm:items-start pt-1">
                    <ExternalLink className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </motion.section>

          {/* More coming */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-12 border-2 border-foreground/20 rounded-3xl p-6 text-center"
          >
            <BookOpen className="w-6 h-6 text-foreground/30 mx-auto mb-3" />
            <p className="font-display font-900 text-base uppercase tracking-wide mb-1">More articles coming</p>
            <p className="font-body text-sm text-muted-foreground">We're building a curated reading list across careers, industries and the world of work.</p>
          </motion.div>

        </section>
      </main>
      <Footer />
    </>
  );
}
