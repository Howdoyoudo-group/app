import { motion } from "framer-motion";
import { Compass, ExternalLink, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const UsingOurSite = () => {
  return (
    <>
      <SEO
        title="Using Our Site | Howdoyoudo?"
        description="Your guide to discovering work you love. Learn how to explore industries, get matched with roles, level up your skills, and find jobs that matter."
      />

      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-4xl mx-auto">

          {/* Hero */}
          <motion.div {...fadeUp} className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-foreground/20 bg-background mb-4">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">How to Use</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground mb-4">
              How do you... use our site?
            </h1>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 md:p-8"
          >
            <h2 className="font-display font-700 text-xl md:text-2xl mb-4">Start with a blank sheet of paper</h2>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              Most of us find it easier to decide what we want for lunch than what we want from our lives - even though work is where we'll spend most of our waking hours. Family, friends, expectations, past experiences and our own insecurities quietly narrow the options before we've even started looking.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              <strong>How Do You Do? exists to widen them again.</strong> This is a place for work curiosity - because curiosity creates ideas, conversations and possibilities, and possibilities improve probabilities. The more you explore, the more chances you give yourself to succeed.
            </p>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              So forget what you're "supposed" to do. Start blank - or better, start with what you love, and see where it takes you. This is about discovering your energy and your purpose, and finding work that actually means something to you.
            </p>
          </motion.div>

          {/* Meet Howdy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-12 border-2 border-primary rounded-2xl p-6 md:p-8 bg-primary/5"
          >
            <h2 className="font-display font-700 text-2xl md:text-3xl mb-4">Meet Howdy, your AI sidekick</h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              Howdy has read the whole site — every industry, role, company and job — and gets to know you too. Fill in your profile and take the quiz, and the more you tell Howdy upfront, the better the matches, plans and suggestions get. Chat to Howdy about anything to do with finding your thing: an industry you're curious about, a role you don't understand, or where to start. Howdy's with you on every page.
            </p>
          </motion.div>

          {/* The 5 Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8 mb-12"
          >
            {/* Step 1 */}
            <div className="border-2 border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0 font-display font-700">
                  1
                </div>
                <h2 className="font-display font-700 text-2xl md:text-3xl">Get inspired</h2>
              </div>
              <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
                Watch <Link to="/the-show" className="text-primary font-600 hover:underline">The HDYD Show</Link> - episodes, pitches, street interviews and shorts from people doing jobs you may never have heard of. Prefer to read? Head to <Link to="/articles" className="text-primary font-600 hover:underline">Articles</Link>. Watch, listen, read - whatever works for you. The goal is simple: stumble onto something you didn't know existed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-2 border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0 font-display font-700">
                  2
                </div>
                <h2 className="font-display font-700 text-2xl md:text-3xl">Discover what's out there</h2>
              </div>
              <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
                Explore <strong>30+ Industries</strong> - from fashion and football to farming and Formula 1 - and hundreds of Roles within them.
              </p>
              <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
                <strong>Here's the thing most careers advice misses: roles are inputs, industries are outputs.</strong> They live together. Music needs lawyers, accountants and marketeers just as much as it needs musicians. So if you love an industry, there's almost certainly a role for your skills inside it — and if you love a role, you can take it almost anywhere.
              </p>
              <p className="font-body text-base text-muted-foreground leading-relaxed">
                Not sure a traditional job is the whole answer? Check out <Link to="/side-hustles" className="text-primary font-600 hover:underline">Side Hustles</Link> (turn what you love into income) and <Link to="/starting-a-business" className="text-primary font-600 hover:underline">Start a Business</Link> (do your own thing).
              </p>
              <p className="font-body text-base text-muted-foreground mt-4 leading-relaxed">
                And explore the companies behind it all. Every profile helps you answer the question that matters: do their values match yours? See what they stand for, and what their own people say about working there — before you apply, not after.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-2 border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0 font-display font-700">
                  3
                </div>
                <h2 className="font-display font-700 text-2xl md:text-3xl">Level Up</h2>
              </div>
              <p className="font-body text-base text-muted-foreground mb-6 leading-relaxed">
                Curiosity opens doors; a plan gets you through them. In Level Up you'll find:
              </p>
              <ul className="space-y-3 mb-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Your Matches</strong>
                    <p className="text-sm text-muted-foreground">Your personality, values and CV, and where they could take you, including Worlds Collide: unexpected combinations worth exploring.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Your Plan</strong>
                    <p className="text-sm text-muted-foreground">Howdy's honest checklist for your target role. Download it, rate your skills, see your gaps, and earn industry badges as you close them.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">The Learning Hub</strong>
                    <p className="text-sm text-muted-foreground">CV tips, further education, online learning, mentoring, interview skills and more.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Experience</strong>
                    <p className="text-sm text-muted-foreground">Internships, apprenticeships, work experience, volunteering, and how to stand out.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="border-2 border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0 font-display font-700">
                  4
                </div>
                <h2 className="font-display font-700 text-2xl md:text-3xl">Find the job</h2>
              </div>
              <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
                Our <Link to="/marketplace" className="text-primary font-600 hover:underline">Jobs Marketplace</Link> is truly dedicated — curated industry by industry, not scraped from everywhere. And <Link to="/my-jobs?tab=jobs" className="text-primary font-600 hover:underline">Howdy Jobs</Link> goes further: our matching algorithm suggests roles and companies based on who you are, not just keywords on a CV. Use the <Link to="/cv-builder" className="text-primary font-600 hover:underline">CV Builder</Link> to build a profile that stands out, and Help Me Apply for cover letters and applications.
              </p>
            </div>

            {/* Step 5 */}
            <div className="border-2 border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0 font-display font-700">
                  5
                </div>
                <h2 className="font-display font-700 text-2xl md:text-3xl">Join in</h2>
              </div>
              <p className="font-body text-base text-muted-foreground leading-relaxed">
                Our <Link to="/community" className="text-primary font-600 hover:underline">Community</Link> is full of like-minded people who'll back you — no boasting required, no need to be "honoured to announce" anything. Ask questions, share what you're exploring, and come along to <Link to="/events" className="text-primary font-600 hover:underline">Events</Link> to see industries up close.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="font-display font-900 text-3xl md:text-4xl mb-4">Push your boundaries</h2>
            <p className="font-body text-base text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
              You don't need to know the answer yet. You just need to be curious enough to look. Pick something you love — an industry, a role you've never heard of, a company you admire — and see where it takes you.
            </p>
            <p className="font-display font-900 text-2xl md:text-3xl text-foreground">
              How do you do?<span className="text-primary"> Let's find out.</span>
            </p>
          </motion.div>

        </section>
      </main>
      <Footer />
    </>
  );
}

export default UsingOurSite;
