import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import Footer from "@/components/Footer";
import { SIDE_HUSTLE_TOPICS } from "@/data/side-hustle-topics";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

const SideHustles = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Side Hustles - Ways to Make Money Part-Time"
        description="A practical UK guide to making money on the side - selling online, freelancing, tutoring, content, pet care, renting out assets, handmade and digital products, local services."
        path="/side-hustles"
      />

      {/* Hero */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-primary" />
              <p className="text-primary text-xs tracking-[0.3em] uppercase font-body">
                Side Hustles
              </p>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-6">
              Side Hustles<span className="text-primary">.</span>
            </h1>
            <p className="font-display text-xl md:text-2xl font-700 leading-snug max-w-3xl mb-6">
              Nobody these days has a totally linear career anymore — and that's a feature, not a bug.
            </p>
            <div className="space-y-4 text-muted-foreground font-body text-base md:text-lg max-w-2xl">
              <p>
                A side hustle is how you test an interest, top up your income, build a skill, or quietly fund the bigger thing you're actually planning. Every square below is a real way young people make money part-time in the UK - and what's inside is curated.
              </p>
              <p>
                Things to <span className="font-700 text-foreground">watch</span> when you're getting started. Podcasts to <span className="font-700 text-foreground">listen</span> to on the bus. Sites and platforms to <span className="font-700 text-foreground">read</span> to actually sign up. And the <span className="font-700 text-foreground">help</span> - the UK rules on tax, insurance and what you need to register before you take a penny.
              </p>
              <p className="text-sm md:text-base italic">
                Our perspective: small income, low risk, real skills. Start one. See what sticks.
              </p>
            </div>
          </motion.div>

          {/* Section Nav - doodle squares linking to per-topic pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-8">
            {SIDE_HUSTLE_TOPICS.map((cat) => (
              <Link
                key={cat.slug}
                to={`/side-hustles/${cat.slug}`}
                className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                  <img
                    src={cat.icon}
                    alt=""
                    className="w-full h-full object-contain"
                    style={{ filter: "brightness(0)" }}
                    loading="lazy"
                    width={512}
                    height={512}
                  />
                </div>
                <span className="font-display font-700 text-[11px] md:text-xs leading-tight tracking-tight text-foreground">
                  {cat.shortTitle}
                </span>
              </Link>
            ))}
          </div>

          <p className="text-muted-foreground font-body text-xs md:text-sm mt-6">
            Tap a square to see what to <span className="font-700 text-foreground">watch</span>, <span className="font-700 text-foreground">listen</span>, <span className="font-700 text-foreground">read</span> and the <span className="font-700 text-foreground">help</span> you'll need.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SideHustles;
