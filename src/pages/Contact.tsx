import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Send, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";

const SUBJECT_OPTIONS = [
  "General enquiry",
  "Feedback or suggestion",
  "Technical issue",
  "Partnership opportunity",
  "Press or media",
  "Other",
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_enquiries" as any).insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject || "General enquiry",
      message: formData.message,
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you soon.");

    // Notify admin
    supabase.functions.invoke("notify-employer-enquiry", {
      body: {
        contact_name: formData.name,
        company_name: "Customer Enquiry",
        email: formData.email,
        phone: "",
        package_interest: formData.subject || "General enquiry",
        industry: "",
        message: formData.message,
      },
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-background">



      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl leading-tight tracking-tight text-foreground">
              Get in touch<span className="text-primary">.</span>
            </h1>
            <p className="mt-6 font-body text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Have a question, feedback, or just want to say hello? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="pb-8 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg text-foreground mb-1">Email us</h3>
              <a href="mailto:hello@howdoyoudo.group" className="font-body text-sm text-primary hover:underline">
                hello@howdoyoudo.group
              </a>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg text-foreground mb-1">Quick response</h3>
              <p className="font-body text-sm text-muted-foreground">We aim to reply within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 md:py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-2xl">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">Message received!</h3>
              <p className="font-body text-muted-foreground">We'll get back to you as soon as possible.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Your name *</label>
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="Jane Smith" required />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" required />
                </div>
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body"
                >
                  <option value="">Select a subject</option>
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Message *</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full font-display text-base h-12 gap-2">
                <Send className="w-4 h-4" />
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
