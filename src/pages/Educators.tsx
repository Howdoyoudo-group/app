import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  GraduationCap,
  Compass,
  FileText,
  Sparkles,
  BookOpen,
  Map,
  Briefcase,
  Download,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { INDUSTRIES as INDUSTRY_LIST, INDUSTRY_COUNT } from "@/data/industries";
import { RESOURCE_TOPICS } from "@/data/resource-topics";

/* What's already on the site, organised for educators */
const TOOLBOX = [
  {
    icon: Compass,
    title: "Industry Unpackings",
    desc: `${INDUSTRY_COUNT} industries explained simply - what people actually do, who's hiring, and the routes in.`,
    href: "/#series",
    cta: "Browse industries",
  },
  {
    icon: Map,
    title: "Career Maps",
    desc: "Visual, non-linear maps of roles inside each industry - useful for one-to-one careers conversations.",
    href: "/influencing",
    cta: "See an example",
  },
  {
    icon: Sparkles,
    title: "Understand Me",
    desc: "An identity-first reflection tool that helps students articulate what they're drawn to and why.",
    href: "/my-profile",
    cta: "Try the tool",
  },
  {
    icon: FileText,
    title: "Profile Builder",
    desc: "AI-assisted, industry-tailored CVs - perfect for first jobs, work experience and apprenticeship applications.",
    href: "/cv-builder",
    cta: "Open the builder",
  },
  {
    icon: BookOpen,
    title: "Resources Hub",
    desc: "Curated Watch / Listen / Read / Help across employability, interviews, money skills, mentoring and more.",
    href: "/learning",
    cta: "Open resources",
  },
  {
    icon: Briefcase,
    title: "Live Jobs Marketplace",
    desc: "Real, live UK roles by industry - apprenticeships, internships, graduate schemes and entry-level work.",
    href: "/marketplace",
    cta: "See live jobs",
  },
];

/* Resource topics that map cleanly to school/college/uni programmes */
const TEACHING_PICKS = [
  "employability",
  "careers",
  "internships-graduates",
  "work-experience",
  "apprenticeships",
  "cv-builder",
  "interview-skills",
  "money",
];

const Educators = () => {
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    role: "",
    email: "",
    phone: "",
    audience: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.institution || !formData.email) {
      toast.error("Please fill in your name, institution and email.");
      return;
    }
    setSubmitting(true);
    const subject = `[EDUCATOR] ${formData.institution}${formData.audience ? ` - ${formData.audience}` : ""}`;
    const message = [
      `Role: ${formData.role || "-"}`,
      `Audience: ${formData.audience || "-"}`,
      `Phone: ${formData.phone || "-"}`,
      "",
      formData.message || "(no message)",
    ].join("\n");
    const { error } = await supabase.from("contact_enquiries").insert({
      name: formData.name,
      email: formData.email,
      subject,
      message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Enquiry sent - we'll be in touch.");
  };

  const pickedTopics = RESOURCE_TOPICS.filter((t) => TEACHING_PICKS.includes(t.slug));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="For Schools, Colleges & Universities - howdoyoudo"
        description="Free careers and employability resources for UK schools, colleges and universities. Industry unpackings, career maps, CVs, interviews, live jobs and more."
        path="/educators"
      />

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-foreground rounded-full mb-6">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="font-body text-xs font-bold uppercase tracking-wider text-foreground">
                For Schools, Colleges & Universities
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-foreground">
              How do you inspire<span className="text-primary">?</span>
            </h1>
            <p className="mt-6 font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We aim to lift the bar for educators and give you much more fun content to share with students — funny content, industries unpacked simply, job ideas, CV tips, interview tools, employability resources, and live UK jobs. Designed for the way young people actually choose what they want to do.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#toolbox">
                <Button size="lg" className="font-display gap-2">
                  Explore the toolbox <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#enquiry-form">
                <Button size="lg" variant="outline" className="font-display gap-2">
                  <Send className="w-4 h-4" /> Talk to us
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Industries unpacked", value: String(INDUSTRY_COUNT) },
              { label: "Resource topics", value: String(RESOURCE_TOPICS.length) },
              { label: "Live UK jobs", value: "Daily" },
              { label: "Cost to use", value: "Free" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-5">
                <div className="font-display text-2xl md:text-3xl text-foreground">{s.value}</div>
                <div className="font-body text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toolbox */}
      <section id="toolbox" className="py-16 md:py-24 px-6 md:px-12 bg-card border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-2xl md:text-4xl text-foreground text-center mb-3">
            The toolbox<span className="text-primary">.</span>
          </h2>
          <p className="font-body text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Drop these into lessons, tutor time, careers fairs, UCAS prep or one-to-ones.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLBOX.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="group bg-background rounded-2xl border border-border p-6 flex flex-col hover:border-primary transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
                  {item.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-primary font-display text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
                  {item.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum-friendly resource topics */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-2xl md:text-4xl text-foreground text-center mb-3">
            Ready-made lesson hooks<span className="text-primary">.</span>
          </h2>
          <p className="font-body text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Each topic gathers Watch, Listen, Read and Help - vetted UK sources, no signup needed.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pickedTopics.map((t) => (
              <Link
                key={t.slug}
                to={`/resources/${t.slug}`}
                className="group p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors"
              >
                <img
                  src={t.icon}
                  alt=""
                  className="w-10 h-10 mb-3"
                  style={{ filter: "brightness(0)" }}
                  loading="lazy"
                />
                <h3 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                  {t.title}
                </h3>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/learning"
              className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-wide text-primary hover:opacity-80"
            >
              See all resources <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Industry one-pagers */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-card border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-4xl text-foreground">
                Print-ready industry one-pagers<span className="text-primary">.</span>
              </h2>
              <p className="font-body text-muted-foreground mt-3 max-w-2xl">
                A printable summary for every industry on the site - the routes in, the kinds of jobs, and where to
                look. Useful as handouts for careers events.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {INDUSTRY_LIST.slice(0, 16).map((ind) => (
              <a
                key={ind.slug}
                href={`/downloads/download-${ind.slug}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 px-3 py-2.5 bg-background border border-border rounded-lg hover:border-primary transition-colors"
              >
                <span className="font-body text-sm text-foreground truncate">{ind.name}</span>
                <Download className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
              </a>
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground mt-4 text-center">
            All {INDUSTRY_COUNT} industries available - open any industry page to find its one-pager.
          </p>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry-form" className="py-16 md:py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-display text-2xl md:text-4xl text-foreground text-center mb-4">
            Bring us in<span className="text-primary">.</span>
          </h2>
          <p className="font-body text-muted-foreground text-center mb-10">
            Workshops, talks, custom resources, or just a chat about how to use the site with your students - drop us a line.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">Enquiry received!</h3>
              <p className="font-body text-muted-foreground">We'll get back to you within a couple of days.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Your name *</label>
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="Jane Smith" required maxLength={100} />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Institution *</label>
                  <Input name="institution" value={formData.institution} onChange={handleChange} placeholder="St. Mary's School" required maxLength={150} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Your role</label>
                  <Input name="role" value={formData.role} onChange={handleChange} placeholder="Careers Lead, Head of Sixth Form…" maxLength={100} />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Audience</label>
                  <select
                    name="audience"
                    value={formData.audience}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
                  >
                    <option value="">Select audience</option>
                    <option value="School (KS3/KS4)">School (KS3 / KS4)</option>
                    <option value="Sixth Form / College">Sixth Form / College</option>
                    <option value="University">University</option>
                    <option value="Mixed / Other">Mixed / Other</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="jane@school.ac.uk" required maxLength={255} />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+44 …" maxLength={30} />
                </div>
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">How can we help?</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us a bit about your students, year groups, and what you'd like - assembly talk, workshop, custom resources, etc."
                  rows={5}
                  maxLength={1500}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full font-display text-base h-12 gap-2">
                <Send className="w-4 h-4" /> {submitting ? "Sending…" : "Send enquiry"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Educators;
