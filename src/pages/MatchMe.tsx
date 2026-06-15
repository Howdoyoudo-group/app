import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, User, Briefcase, Building2, Shuffle, Brain, Wallet, Layers } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg-industries.jpg";
import howdyMascot from "@/assets/howdy-mascot.png";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const TILES: Array<{ title: string; href: string; Icon: React.ElementType; img?: string }> = [
  { title: "What We Know",         href: "/match-me/what-we-know",             Icon: Layers },
  { title: "Howdy Jobs",           href: "/my-jobs?tab=jobs",                  Icon: Briefcase, img: howdyMascot },
  { title: "Suggested Roles",      href: "/match-me/suggested-roles",          Icon: Briefcase },
  { title: "Suggested Industries", href: "/match-me/suggested-industries",     Icon: Building2 },
  { title: "Worlds Collide",       href: "/match-me/worlds-collide",           Icon: Shuffle },
  { title: "What If Machine",      href: "/match-me/what-if-machine",          Icon: Brain },
  { title: "Side Hustles",         href: "/side-hustles",                      Icon: Wallet },
];

export default function MatchMe() {
  const { user } = useAuth();

  return (
    <>
      <SEO title="Match Me | Howdoyoudo?" description="Discover the roles, industries and opportunities that match who you are." />
      <main className="min-h-screen bg-background">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <img src={heroBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none select-none" />
          <div className="relative px-4 sm:px-6 lg:px-10 pt-10 pb-14 max-w-5xl mx-auto text-center">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="font-display font-700 text-xs uppercase tracking-widest">Your matches</span>
              </div>
              <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                Here's your<br />big picture.
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                Everything we know about you, how we use it, and where it could take you.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto py-12">
          {!user ? (
            <motion.div {...fadeUp} className="text-center py-16 border-2 border-dashed border-foreground/20 rounded-3xl">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display font-900 text-2xl mb-2">Sign in to see your matches</h2>
              <p className="font-body text-muted-foreground mb-6">Create your profile and we'll match you to roles and opportunities.</p>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/auth">Sign in / Create account <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div {...fadeUp}>
              <p className="font-body text-sm text-muted-foreground mb-6">Pick a section to explore your personalised matches.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {TILES.map((tile) => (
                  <Link
                    key={tile.title}
                    to={tile.href}
                    className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
                  >
                    {tile.img ? (
                      <img src={tile.img} alt="" className="w-20 h-20 md:w-24 md:h-24 object-contain" loading="lazy" />
                    ) : (
                      <tile.Icon className="w-14 h-14 md:w-16 md:h-16 text-foreground" strokeWidth={1.25} />
                    )}
                    <span className="font-display font-700 text-[11px] md:text-xs leading-tight tracking-tight text-foreground">
                      {tile.title}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
