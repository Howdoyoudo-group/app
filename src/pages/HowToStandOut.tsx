import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb, Users, Trophy, Rocket, Heart, Wrench } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const sections = [
  {
    icon: <Rocket className="w-6 h-6" />,
    color: "bg-primary/10 border-primary/30",
    iconBg: "bg-primary/20",
    title: "Side Hustles",
    subtitle: "Turn a skill into income — or just prove you can make things happen.",
    ideas: [
      { title: "Freelance Design or Photography", desc: "Create logos, social graphics or shoot events. One client builds a portfolio, a portfolio builds more clients." },
      { title: "Content Creation", desc: "Build an audience around something you know — music, sport, style, gaming, food. Consistency matters more than polish." },
      { title: "Tutoring or Teaching", desc: "If you're good at a subject, someone younger needs your help. Tutor students, teach adults, run workshops online." },
      { title: "Social Media Management", desc: "Help local businesses grow. It's a learnable skill most small businesses desperately need and can't afford agencies for." },
      { title: "Selling Online", desc: "Resell vintage clothes, handmade items, digital products. Platforms like Depop, Etsy and Vinted remove most of the barrier." },
      { title: "Copywriting & Content Writing", desc: "Write for brands, blogs and newsletters. One of the most remote-friendly, flexible skills you can build." },
    ],
    cta: { label: "Explore Side Hustles", to: "/side-hustles" },
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    color: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100",
    title: "Projects & Building Things",
    subtitle: "The best CV line you can have is something you made yourself.",
    ideas: [
      { title: "Start a Podcast or YouTube Channel", desc: "Pick a niche, commit to 10 episodes. The discipline, editing and promotion skills you learn are more impressive than the view count." },
      { title: "Build an App or Website", desc: "Even a simple tool you made to solve a problem shows initiative. Free tools like Webflow, Glide and Bubble mean you don't need to code." },
      { title: "Launch a Newsletter", desc: "Curate and comment on a topic you care about. Substack makes it free. Consistency over a few months shows employers you can ship." },
      { title: "Create a Zine or Blog", desc: "Document your thinking on a subject. Shows communication skills, expertise and commitment — all of which matter to employers." },
      { title: "Enter a Competition", desc: "Business competitions, hackathons, design challenges, writing prizes. Even entering shows initiative. Winning changes your whole CV." },
      { title: "Build a Community", desc: "Start a Discord, WhatsApp group or club around something you care about. Running a community is a serious leadership credential." },
    ],
    cta: null,
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    title: "Leadership & Organisation",
    subtitle: "You don't need a job title to lead something.",
    ideas: [
      { title: "Run a School or University Society", desc: "Chair, secretary, treasurer — these roles show you can organise people and events. Mention exactly what you improved or grew." },
      { title: "Organise an Event", desc: "A gig, a pop-up, a sports day, a careers fair. Logistics, promotion and people management all in one. Genuinely impressive." },
      { title: "Start a Club or Initiative", desc: "Notice a gap? Fill it. A lunch club, study group, social media account for your school, a campaign. Employers love people who start things." },
      { title: "Take on Responsibility at Work", desc: "Even in a part-time job — train a new team member, suggest an improvement, take on a project. Document it and talk about it." },
      { title: "Mentor Someone Younger", desc: "Formal through a programme or informal. Teaching others cements your own knowledge and shows emotional intelligence." },
    ],
    cta: null,
  },
  {
    icon: <Heart className="w-6 h-6" />,
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    title: "Volunteering & Community",
    subtitle: "Give time — and show you care about something beyond yourself.",
    ideas: [
      { title: "Volunteer Regularly", desc: "Weekly commitment to a charity, food bank, sports club or community project. Regular beats one-off every time." },
      { title: "Join a Charity Trustee Board", desc: "Many charities actively look for young trustees. You'd sit on a board, help make decisions, and get serious governance experience." },
      { title: "Fundraise for Something", desc: "Set a goal, create a page, make it public. Shows planning, communication, resilience and purpose." },
      { title: "Support a Local Cause", desc: "Help a local school, sports club or community space. Visible, local impact is powerful — and often easier to get than you think." },
    ],
    cta: { label: "Find Volunteering Opportunities", to: "/resources/volunteering" },
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
    title: "Sport, Performance & Achievement",
    subtitle: "Anything that required dedication, discipline or teamwork counts.",
    ideas: [
      { title: "Represent a Team or Club", desc: "Playing at any level shows commitment, teamwork and the ability to handle pressure. Captaincy doubles it." },
      { title: "Compete Individually", desc: "Running, swimming, chess, gaming — anything with rankings or results. It shows self-motivation in a way nothing else can." },
      { title: "Perform Publicly", desc: "Theatre, music, dance, comedy, spoken word. Being comfortable performing shows confidence employers rate highly." },
      { title: "Coach or Referee", desc: "If you're not competing, being the person who makes the game happen is just as impressive — sometimes more." },
    ],
    cta: null,
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    color: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100",
    title: "Skills You Can Learn Now",
    subtitle: "Certifications and credentials that cost little but signal a lot.",
    ideas: [
      { title: "Google & Meta Certifications", desc: "Digital marketing, analytics, data — all free or very low cost. Recognised by employers and easy to add to a CV or LinkedIn." },
      { title: "First Aid Certificate", desc: "Takes a weekend. Shows maturity and responsibility. Comes up far more often in interviews than you'd expect." },
      { title: "Driving Licence", desc: "Opens a huge number of job opportunities, especially outside cities. Worth doing young if you can." },
      { title: "Learn to Code (Basics)", desc: "HTML/CSS, Python basics, or even no-code tools. You don't need to become a developer — you just need to understand the language." },
      { title: "Language Skills", desc: "Even conversational-level Spanish, French or Mandarin stands out. Duolingo streaks don't count — lessons, exams or real use does." },
      { title: "Financial Literacy", desc: "Read about investing, tax, budgeting. Candidates who understand money stand out in almost every commercial role." },
    ],
    cta: { label: "Browse Learning Hub", to: "/learning" },
  },
];

export default function HowToStandOut() {
  return (
    <>
      <SEO
        title="How to Stand Out | Howdoyoudo?"
        description="Ideas for side hustles, projects, leadership and skills that make you genuinely stand out to employers."
      />

      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-foreground/20 bg-background mb-4">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">Stand out</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground mb-4">
              How to stand out.
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl">
              A degree or good grades gets you in the pile. What you've built, led, made or committed to is what gets you the interview.
              Here's everything you can do — right now — to become genuinely hard to ignore.
            </p>
          </motion.div>

          <div className="space-y-12">
            {sections.map((s, i) => (
              <motion.section
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                    {s.icon}
                  </div>
                  <div>
                    <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide">{s.title}</h2>
                    <p className="font-body text-xs text-muted-foreground">{s.subtitle}</p>
                  </div>
                </div>

                {/* Ideas grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {s.ideas.map((idea) => (
                    <div
                      key={idea.title}
                      className={`border-2 ${s.color} rounded-2xl p-4`}
                    >
                      <p className="font-display font-900 text-sm uppercase tracking-wide mb-1">{idea.title}</p>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">{idea.desc}</p>
                    </div>
                  ))}
                </div>

                {s.cta && (
                  <div className="mt-4">
                    <Link
                      to={s.cta.to}
                      className="inline-flex items-center gap-1.5 font-display font-700 text-xs uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                    >
                      {s.cta.label} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </motion.section>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 border-2 border-foreground rounded-3xl p-6 md:p-8 bg-primary/5 text-center"
          >
            <h2 className="font-display font-900 text-2xl uppercase tracking-wide mb-2">Ready to get started?</h2>
            <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Match Me shows you the roles and industries where everything you've built will make the most difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/match-me"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-foreground bg-primary font-display font-900 text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              >
                See your matches <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cv-builder"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-foreground bg-background font-display font-900 text-sm uppercase tracking-wide hover:bg-primary transition-colors"
              >
                Build my profile
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
