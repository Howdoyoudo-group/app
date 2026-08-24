import { motion } from "framer-motion";
import { Compass, ExternalLink, CheckCircle, Play } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { launchHowdyTour } from "@/components/HowdyTour";
import HowdyReadAloud from "@/components/HowdyReadAloud";

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
            <HowdyReadAloud src="/audio/howdy-start-blank-sheet.mp3" />
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              There are thousands of jobs in the world, yet most of us only ever consider a handful. Not because the others aren't for us, but because we never knew they existed.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              Long before we've even started looking, our choices have often been narrowed by family, friends, expectations, past experiences and our own insecurities. We rule things out without ever really knowing what's possible.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              At the same time, we're constantly told that AI will replace jobs and that the future of work is uncertain. Yet people will always eat, drink, watch films, listen to music, play sport, have pets, need healthcare, live in homes and travel. The industries behind those things aren't disappearing. They're evolving.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              What most of us never see is the extraordinary variety of work that makes everyday life possible.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              Take football. We think about the players, but behind every match are groundskeepers preparing the pitch, designers creating the kit, manufacturers producing the balls, broadcasters telling the story, photographers capturing the moments, ticketing teams welcoming fans, data analysts, marketers, accountants, lawyers, physiotherapists, software engineers and hundreds of other people. Every industry is like that. Behind the things you already love are thousands of jobs you may never have considered.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              <strong>That's why How Do You Do? exists.</strong>
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              We're here to help you become curious about work.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              Because curiosity creates ideas. Ideas create conversations. Conversations create opportunities. And opportunities improve probabilities.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              So forget what you're "supposed" to do.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              Start with a blank page. Or better still, start with what you love.
            </p>
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              Explore the industries that interest you. Discover the people who work in them. Learn what their jobs are really like. Find pathways you never knew existed.
            </p>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              The answer to your future might not be somewhere far away. It might have been all around you all along.
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
            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              Howdy has read the whole site — every industry, role, company and job — and gets to know you too. Fill in your profile and take the quiz, and the more you tell Howdy upfront, the better the matches, plans and suggestions get. Chat to Howdy about anything to do with finding your thing: an industry you're curious about, a role you don't understand, or where to start. Howdy's with you on every page.
            </p>
            <a href="https://www.youtube.com/embed/o0YUzxz4eSs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-600 hover:underline">
              <Play className="w-4 h-4" />
              Watch the Howdy intro
            </a>
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
                Watch <Link to="/the-show" className="text-primary font-600 hover:underline">The HDYD Show</Link> - episodes, pitches, street interviews and shorts from people doing jobs you may never have heard of. Prefer to read? Head to <Link to="/articles" className="text-primary font-600 hover:underline">Reading</Link>. Watch, listen, read - whatever works for you. The goal is simple: stumble onto something you didn't know existed.
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
              <p className="font-body text-xs text-muted-foreground/70 mb-4">
                Inspired by <a href="https://www.theschooloflife.com/products/a-job-to-love-book" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary hover:underline">The School of Life's "A Job to Love"</a>
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
            <p className="font-display font-900 text-2xl md:text-3xl text-foreground mb-8">
              How do you do?<span className="text-primary"> Let's find out.</span>
            </p>
            <button
              onClick={() => launchHowdyTour()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-700 hover:opacity-90 transition-opacity"
            >
              Take the tour
            </button>
          </motion.div>

        </section>
      </main>
      <Footer />
    </>
  );
}

export default UsingOurSite;
