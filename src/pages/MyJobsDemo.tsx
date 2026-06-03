import { Link } from "react-router-dom";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { Briefcase, Mail, Newspaper, Sparkles, Building2, MapPin, Clock } from "lucide-react";

const demoJobs = [
  { title: "Junior Buyer", company: "ASOS", location: "London", posted: "2 days ago", match: 92, industry: "Fashion" },
  { title: "Marketing Coordinator", company: "Burberry", location: "London", posted: "1 day ago", match: 88, industry: "Fashion" },
  { title: "Assistant Producer", company: "Netflix", location: "London (hybrid)", posted: "3 days ago", match: 84, industry: "Cinema" },
  { title: "Visual Merchandiser", company: "Selfridges", location: "London", posted: "today", match: 81, industry: "Fashion" },
];

const demoBriefings = [
  { industry: "Fashion", headline: "LVMH posts record Q3 as Asia rebounds", time: "07:00" },
  { industry: "Cinema", headline: "UK box office up 14% on last summer", time: "07:00" },
];

const demoEmployers = [
  { name: "ASOS", note: "Saw your profile - would love to chat about a Buyer role.", when: "yesterday" },
  { name: "Premier League", note: "We're hiring in commercial - interested?", when: "3 days ago" },
];

export default function MyJobsDemo() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Demo preview · MyInbox</p>
            <h1 className="text-3xl md:text-4xl font-black">Your Inbox</h1>
            <p className="text-muted-foreground mt-1">A taste of what lands in your inbox each morning. <Link to="/auth" className="underline font-semibold">Sign in</Link> to get the real thing.</p>
          </div>
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            <Sparkles className="h-4 w-4" /> Set up my Inbox
          </Link>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5" /> Matched jobs · today</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {demoJobs.map((j) => (
              <div key={j.title} className="rounded-xl border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_hsl(var(--foreground))]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{j.industry}</p>
                    <h3 className="font-bold text-base">{j.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                    </p>
                  </div>
                  <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">{j.match}% fit</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="h-3 w-3" /> {j.posted}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Newspaper className="h-5 w-5" /> Daily briefings</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {demoBriefings.map((b) => (
              <div key={b.industry} className="rounded-xl border-2 border-foreground bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{b.industry} · {b.time}</p>
                <p className="font-semibold mt-1">{b.headline}</p>
                <Link to="/briefings" className="text-xs underline mt-2 inline-block">See full briefing →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Mail className="h-5 w-5" /> Employers reaching out</h2>
          <div className="space-y-2">
            {demoEmployers.map((e) => (
              <div key={e.name} className="rounded-xl border-2 border-foreground bg-card p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{e.name}</p>
                  <p className="text-sm text-muted-foreground">"{e.note}"</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{e.when}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
