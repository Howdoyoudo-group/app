import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Users, Megaphone, BarChart3, Send, CheckCircle2, Briefcase, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import { INDUSTRIES as INDUSTRY_LIST, INDUSTRY_COUNT } from "@/data/industries";

const INDUSTRIES = INDUSTRY_LIST.map((i) => i.name);

const packages = [
  {
    name: "Spotlight",
    icon: Star,
    description: "Get your brand in front of early-career talent actively exploring your industry.",
    features: [
      "Company culture profile page",
      "Logo & brand on industry page",
      "5 job listings per month",
      "Employer badge on listings",
    ],
  },
  {
    name: "Amplify",
    icon: Megaphone,
    description: "Full visibility across the platform with priority placement and community features.",
    features: [
      "Everything in Spotlight",
      "Featured employer status",
      "Unlimited job listings",
      "Inclusion in daily digest emails",
      "Priority placement in marketplace",
      "Career profile interview feature",
    ],
    popular: true,
  },
  {
    name: "Partner",
    icon: Zap,
    description: "A strategic partnership to build your employer brand with the next generation.",
    features: [
      "Everything in Amplify",
      "Dedicated industry podcast feature",
      "Content, newsletter & virtual work experience module",
      "Access to candidate insights & analytics",
      "Bespoke recruitment campaigns",
      "Direct community engagement",
    ],
  },
];

const Employers = () => {
  const [formData, setFormData] = useState({
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
    package_interest: "",
    industry: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [jobCount, setJobCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("jobs").select("id", { count: "planned", head: true }).then(({ count }) => {
      if (count !== null) setJobCount(count);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_name || !formData.company_name || !formData.email) {
      toast.error("Please fill in your name, company and email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("employer_enquiries" as any).insert({
      contact_name: formData.contact_name,
      company_name: formData.company_name,
      email: formData.email,
      phone: formData.phone || null,
      package_interest: formData.package_interest || "general",
      industry: formData.industry || null,
      message: formData.message || null,
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Enquiry sent! We'll be in touch soon.");

    // Notify admin
    supabase.functions.invoke("notify-employer-enquiry", {
      body: {
        contact_name: formData.contact_name,
        company_name: formData.company_name,
        email: formData.email,
        phone: formData.phone || "",
        package_interest: formData.package_interest || "general",
        industry: formData.industry || "",
        message: formData.message || "",
      },
    }).catch(console.error);
  };

  const selectPackage = (name: string) => {
    setFormData(prev => ({ ...prev, package_interest: name }));
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Partner login (top-right). Back to home is provided by the GlobalHomeButton (top-left). */}
      <Link
        to="/employer-login"
        className="fixed top-3 right-3 md:top-6 md:right-6 z-50 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide bg-primary text-foreground border-2 border-foreground px-4 py-2 rounded-full hover:bg-foreground hover:text-background transition"
      >
        <Building2 className="w-3.5 h-3.5" />
        Partner login
      </Link>

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-foreground">
              Hire the<br />
              curious<span className="text-primary">.</span>
            </h1>
            <p className="mt-6 font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              How do you find brilliant talent? – we deliver expertly and uniquely curated profiles, starting with what people love and the things they are curious and passionate about. We bring a scale audience and fast efficient access to the best talent UK wide, including not just those looking for a role but uniquely those inspired to change and want to stand out from the crowd.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {[
              { label: "Industries", value: String(INDUSTRY_COUNT) },
              { label: "Active jobs", value: jobCount ? jobCount.toLocaleString() + "+" : "Loading…" },
              { label: "Community members", value: "Growing" },
              { label: "Daily digest readers", value: "Active" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
                <div className="font-display text-2xl md:text-3xl text-foreground">{stat.value}</div>
                <div className="font-body text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-card border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-2xl md:text-4xl text-foreground text-center mb-12">
            Why howdoyoudo<span className="text-primary">?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Targeted reach",
                desc: "Your roles are seen by people actively exploring careers in your exact industry - not a mass job board.",
              },
              {
                icon: Building2,
                title: "Employer branding",
                desc: "Dedicated company culture pages, career profiles, and podcast features that tell your story.",
              },
              {
                icon: BarChart3,
                title: "Smart matching",
                desc: "Our AI-powered role matching ensures the right candidates see your opportunities first.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-2xl md:text-4xl text-foreground text-center mb-4">
            Employer packages<span className="text-primary">.</span>
          </h2>
          <p className="font-body text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Flexible packages tailored to your hiring needs. Get in touch and we'll build the right plan for you.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative bg-card rounded-2xl border p-6 md:p-8 flex flex-col ${
                  pkg.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-body text-xs font-semibold px-4 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <pkg.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">{pkg.name}</h3>
                <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">{pkg.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 font-body text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => selectPackage(pkg.name)}
                  variant={pkg.popular ? "default" : "outline"}
                  className="w-full font-display"
                >
                  Enquire now
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquiry-form" className="py-16 md:py-24 px-6 md:px-12 bg-card border-y border-border">
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-display text-2xl md:text-4xl text-foreground text-center mb-4">
            Get in touch<span className="text-primary">.</span>
          </h2>
          <p className="font-body text-muted-foreground text-center mb-10">
            Tell us about your company and we'll put together a package that works for you.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">Enquiry received!</h3>
              <p className="font-body text-muted-foreground">We'll be in touch within 24 hours to discuss your needs.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Your name *</label>
                  <Input name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Jane Smith" required />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Company name *</label>
                  <Input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Acme Ltd" required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="jane@acme.com" required />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+44 7700 900000" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Package interest</label>
                  <select
                    name="package_interest"
                    value={formData.package_interest}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body"
                  >
                    <option value="">Select a package</option>
                    <option value="Spotlight">Spotlight</option>
                    <option value="Amplify">Amplify</option>
                    <option value="Partner">Partner</option>
                    <option value="general">Not sure yet</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body"
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your hiring needs, team size, or any questions you have..."
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full font-display text-base h-12 gap-2">
                <Send className="w-4 h-4" />
                {submitting ? "Sending…" : "Send enquiry"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Post a Job CTA */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl text-center">
          <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-4xl text-foreground mb-4">
            Got a role to fill<span className="text-primary">?</span>
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-lg mx-auto">
            Send us your job details and we'll get it live on the marketplace. 
            Include the role, location, salary and a link to your application page.
          </p>
          <Button onClick={() => selectPackage("Job posting")} className="font-display gap-2">
            <Send className="w-4 h-4" /> Post a job
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Employers;
