import { Link } from "react-router-dom";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { Sparkles, User, Heart, Target, BookOpen } from "lucide-react";

export default function MyProfileDemo() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Demo preview · Understand Me</p>
            <h1 className="text-3xl md:text-4xl font-black">Your Profile</h1>
            <p className="text-muted-foreground mt-1">A sample of what your magazine profile looks like. <Link to="/auth" className="underline font-semibold">Sign in</Link> to build your own.</p>
          </div>
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            <Sparkles className="h-4 w-4" /> Build my profile
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-foreground bg-card overflow-hidden shadow-[6px_6px_0_hsl(var(--foreground))]">
          <div className="p-6 md:p-10 bg-primary/10 border-b-2 border-foreground">
            <p className="text-xs uppercase tracking-widest font-bold">The Profile · Issue 01</p>
            <h2 className="font-black text-4xl md:text-5xl mt-2">Sam Carter</h2>
            <p className="text-lg text-muted-foreground mt-1">Curious creative · 4 years in fashion buying · loves market days and long walks</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Fashion", "Buying", "Sustainability", "London"].map((t) => (
                <span key={t} className="rounded-full bg-foreground text-background px-3 py-1 text-xs font-bold">{t}</span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-foreground">
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide font-bold flex items-center gap-1"><User className="h-3 w-3" /> RIASEC</p>
              <ul className="mt-2 text-sm space-y-1">
                <li className="flex justify-between"><span>Artistic</span><b>82</b></li>
                <li className="flex justify-between"><span>Enterprising</span><b>74</b></li>
                <li className="flex justify-between"><span>Social</span><b>68</b></li>
              </ul>
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide font-bold flex items-center gap-1"><Heart className="h-3 w-3" /> Loves</p>
              <p className="text-sm mt-2">Vintage markets, indie cinema, batch-cooking on Sundays, her whippet Mabel.</p>
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide font-bold flex items-center gap-1"><Target className="h-3 w-3" /> Most wanted</p>
              <p className="text-sm mt-2">A senior buyer role at a brand that takes sustainability seriously.</p>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t-2 border-foreground">
            <p className="text-xs uppercase tracking-wide font-bold flex items-center gap-1"><BookOpen className="h-3 w-3" /> Career so far</p>
            <ol className="mt-3 space-y-3 text-sm">
              <li><b>Assistant Buyer</b> · Selfridges · 2022–today</li>
              <li><b>Buying Admin Assistant</b> · ASOS · 2020–2022</li>
              <li><b>BA Fashion Marketing</b> · LCF · 2017–2020</li>
            </ol>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          The real thing pulls in your CV, RIASEC results, loves, photos and goals - and you can export it as a PDF magazine.
        </p>
      </main>
      <Footer />
    </div>
  );
}
