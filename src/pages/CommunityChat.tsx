import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MessageCircle, Sparkles, Shield, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, Flag,
} from "lucide-react";

const LIME = "#00E600";

const GUIDELINES: { title: string; body: string }[] = [
  {
    title: "Be kind and respectful",
    body: "Talk to others the way you'd want to be talked to. Disagreement is fine; personal attacks are not.",
  },
  {
    title: "Zero tolerance for hate, harassment or discrimination",
    body: "No racism, sexism, homophobia, transphobia, ableism, religious hate or any other form of discrimination. No harassment, bullying, threats or doxxing.",
  },
  {
    title: "No sexual or explicit content",
    body: "Keep conversation work-appropriate. No nudity, sexual content, sexual advances or grooming behaviour. Anyone targeting minors will be reported.",
  },
  {
    title: "No spam, scams or unsolicited promotion",
    body: "Don't flood channels, push MLMs, run scams, or DM members with unsolicited sales pitches.",
  },
  {
    title: "Protect privacy",
    body: "Don't share other members' personal info, screenshots of private DMs, or anything shared in confidence.",
  },
  {
    title: "Report, don't retaliate",
    body: "If someone breaks the rules, use the Report button. Don't engage or escalate. Moderators will act.",
  },
];

const CommunityChat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [dob, setDob] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  // join form state
  const [dobInput, setDobInput] = useState("");
  const [agreeGuidelines, setAgreeGuidelines] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("community_chat_joined, community_chat_agreed_at, date_of_birth")
        .eq("id", user.id)
        .maybeSingle();
      const p = data as any;
      setJoined(Boolean(p?.community_chat_joined));
      setDob(p?.date_of_birth || null);
      setLoading(false);
    })();
  }, []);

  const calcAge = (iso: string): number | null => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const handleJoin = async () => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    if (!dobInput) {
      toast.error("Please add your date of birth");
      return;
    }
    const age = calcAge(dobInput);
    if (age === null || age < 0) {
      toast.error("Please enter a valid date of birth");
      return;
    }
    if (age < 16) {
      toast.error("You must be 16 or older to join community chat");
      return;
    }
    if (!agreeGuidelines || !agreeAge) {
      toast.error("Please agree to the guidelines and age confirmation");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        date_of_birth: dobInput,
        community_chat_agreed_at: new Date().toISOString(),
        community_chat_joined: true,
      } as any)
      .eq("id", userId);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save your details. Please try again.");
      return;
    }
    setJoined(true);
    setDob(dobInput);
    setShowJoin(false);
    toast.success("You're on the list — we'll let you know when chat opens.");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>

        {/* Hero */}
        <section className="rounded-3xl border-2 border-foreground p-6 md:p-10 bg-[hsl(120,60%,96%)] mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-display uppercase tracking-wider"
              style={{ background: LIME, color: "#000" }}
            >
              <Sparkles className="w-3 h-3" /> Coming soon
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-900 leading-[0.95] tracking-tight mb-3">
            Community Chat<span style={{ color: LIME }}>.</span>
          </h1>
          <p className="font-body text-base md:text-lg text-foreground/80 max-w-2xl mb-6">
            Live channels to swap notes with other members across industries — ask for advice, share
            wins, find collaborators. We're building it now. Join the early list to be first in.
          </p>

          {loading ? (
            <Button disabled size="lg" className="rounded-full">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading
            </Button>
          ) : !userId ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/auth">Sign in to join the list</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/community">Browse community</Link>
              </Button>
            </div>
          ) : joined ? (
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-background px-5 py-3 font-display text-sm">
              <CheckCircle2 className="w-4 h-4" style={{ color: LIME }} />
              You're on the early list. We'll email you when chat opens.
            </div>
          ) : (
            <Button size="lg" className="rounded-full" onClick={() => setShowJoin(true)}>
              Join the early list
            </Button>
          )}
        </section>

        {/* Guidelines */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            <h2 className="font-display text-2xl md:text-3xl font-700">
              Community Chat Guidelines
            </h2>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-6 max-w-2xl">
            Everyone who joins agrees to these rules. Break them and we'll remove your access.
            Serious breaches (illegal content, threats, targeting minors) are reported to the
            relevant authorities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GUIDELINES.map((g) => (
              <div
                key={g.title}
                className="rounded-2xl border-2 border-foreground/10 p-4 bg-background"
              >
                <div className="font-display font-700 text-sm mb-1">{g.title}</div>
                <p className="font-body text-sm text-foreground/75">{g.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reporting */}
        <section className="mb-10 rounded-2xl border-2 border-foreground/10 p-5 bg-background">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4 text-destructive" />
            <h3 className="font-display font-700 text-lg">Reporting members</h3>
          </div>
          <p className="font-body text-sm text-foreground/75">
            Every member card and chat message will carry a Report button. Reports are
            confidential and reviewed by our moderation team. If you've already seen something
            that worries you, you can{" "}
            <Link to="/contact" className="underline font-semibold">contact us</Link>{" "}
            directly.
          </p>
        </section>

        {/* Age + safeguarding */}
        <section className="mb-10 rounded-2xl border-2 border-foreground/10 p-5 bg-background">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-display font-700 text-lg">16+ only</h3>
          </div>
          <p className="font-body text-sm text-foreground/75">
            Community chat is for members aged 16 and over. You'll be asked to confirm your date
            of birth before you join. Accounts found to belong to under-16s will be removed from
            chat. See our{" "}
            <Link to="/terms" className="underline font-semibold">Terms &amp; Privacy</Link>{" "}
            for how we handle this information.
          </p>
        </section>
      </main>

      <Footer />

      {/* Join dialog */}
      <Dialog open={showJoin} onOpenChange={setShowJoin}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join Community Chat</DialogTitle>
            <DialogDescription>
              We need a couple of details before we add you to the early list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dob" className="text-xs uppercase tracking-wider font-display">
                Date of birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dobInput}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDobInput(e.target.value)}
                className="mt-2"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Used to verify you're 16+. Not shown to other members.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border">
              <Checkbox
                checked={agreeAge}
                onCheckedChange={(v) => setAgreeAge(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm">
                I confirm I am <strong>16 years or older</strong> and the date of birth above is accurate.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border">
              <Checkbox
                checked={agreeGuidelines}
                onCheckedChange={(v) => setAgreeGuidelines(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm">
                I have read and agree to the <strong>Community Chat Guidelines</strong> above and the{" "}
                <Link to="/terms" target="_blank" className="underline">Terms &amp; Privacy</Link>.
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoin(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleJoin} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join the list"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityChat;
