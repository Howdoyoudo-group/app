import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FileText, Download, Sparkles, Loader2, Mail, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CareerStage, RoleDetail } from "@/components/CareerMap";
import { supabase } from "@/integrations/supabase/client";

type Experience = {
  id: string;
  title: string;
  company: string;
  dates: string;
  description: string;
};

type Education = {
  id: string;
  institution: string;
  degree: string;
  dates: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);

interface IndustryCVBuilderProps {
  industry: string;
  stages: CareerStage[];
}

const IndustryCVBuilder = ({ industry, stages }: IndustryCVBuilderProps) => {
  const { user } = useAuth();
  // Personal
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: uid(), title: "", company: "", dates: "", description: "" },
  ]);

  // Education
  const [educations, setEducations] = useState<Education[]>([
    { id: uid(), institution: "", degree: "", dates: "" },
  ]);

  // Skills
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  // AI
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isAdapting, setIsAdapting] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((sk) => sk !== s));

  const addExperience = () =>
    setExperiences([...experiences, { id: uid(), title: "", company: "", dates: "", description: "" }]);
  const removeExperience = (id: string) =>
    setExperiences(experiences.filter((e) => e.id !== id));
  const updateExperience = (id: string, field: keyof Experience, value: string) =>
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addEducation = () =>
    setEducations([...educations, { id: uid(), institution: "", degree: "", dates: "" }]);
  const removeEducation = (id: string) =>
    setEducations(educations.filter((e) => e.id !== id));
  const updateEducation = (id: string, field: keyof Education, value: string) =>
    setEducations(educations.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const allRoles = stages.flatMap((s) => s.roles);

  const getCVData = () => ({
    fullName, email, phone, location, summary, skills,
    experiences: experiences.filter((e) => e.title),
    educations: educations.filter((e) => e.institution),
  });

  const handleAdaptCV = async (role: RoleDetail) => {
    setSelectedRole(role);
    setIsAdapting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cv-content", {
        body: { type: "adapt-cv", industry, role, cv: getCVData() },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed");

      const result = data.data;
      if (result.summary) setSummary(result.summary);
      if (result.skills?.length) {
        setSkills((prev) => {
          const combined = new Set([...prev, ...result.skills]);
          return Array.from(combined);
        });
      }
      toast.success(`CV adapted for ${role.name}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to adapt CV");
    } finally {
      setIsAdapting(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedRole) {
      toast.error("Select a role from the career map first");
      return;
    }
    setIsGeneratingLetter(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cv-content", {
        body: { type: "cover-letter", industry, role: selectedRole, cv: getCVData() },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed");

      setCoverLetter(data.data.coverLetter);
      toast.success("Covering letter generated");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate covering letter");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const hasContent = fullName || experiences.some((e) => e.title) || skills.length > 0;

  if (!user) {
    return (
      <div className="border border-border p-6 text-center space-y-3">
        <LogIn className="w-6 h-6 text-primary mx-auto" />
        <p className="font-display font-700 text-sm text-foreground">Sign in to build your CV</p>
        <p className="font-body text-xs text-muted-foreground">Create an account or sign in to use the CV builder.</p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-700 text-xs tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      id="cv-builder"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 scroll-mt-24"
    >
      <div className="border border-primary/30 bg-primary/5 p-6 md:p-8 text-center">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
          Profile Builder<span className="text-primary">.</span>
        </h2>
        <p className="text-muted-foreground font-body text-sm mb-5 max-w-lg mx-auto">
          Build your CV, then use AI to tailor it to any role from the {industry} career map - and generate a matching covering letter.
        </p>
        {!isExpanded && (
          <Button
            onClick={() => setIsExpanded(true)}
            className="font-display font-600 text-sm tracking-wide uppercase gap-2"
          >
            <FileText className="w-4 h-4" /> Build your CV
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="pt-8">

      {/* Role Selector */}
      <div className="border border-border bg-card p-5 mb-6">
        <h3 className="font-display font-700 text-foreground flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          Select a role to tailor your CV
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {stages.map((stage) => (
            <div key={stage.title} className="w-full mb-2">
              <span className="text-xs text-muted-foreground font-body uppercase tracking-widest">{stage.title}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {stage.roles.map((role) => (
                  <Badge
                    key={role.name}
                    variant={selectedRole?.name === role.name ? "default" : "secondary"}
                    className="text-xs font-body cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => handleAdaptCV(role)}
                  >
                    {isAdapting && selectedRole?.name === role.name ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : null}
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          {/* Personal Details */}
          <div className="border border-border bg-card p-5 space-y-4">
            <h3 className="font-display font-700 text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Personal Details
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="font-body bg-background" />
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="font-body bg-background" />
              <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="font-body bg-background" />
              <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="font-body bg-background" />
              <Input placeholder="LinkedIn URL (optional)" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="font-body bg-background md:col-span-2" />
            </div>
            <Textarea placeholder="Professional summary – 2-3 sentences about who you are" value={summary} onChange={(e) => setSummary(e.target.value)} className="font-body bg-background min-h-[80px]" />
          </div>

          {/* Experience */}
          <div className="border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-700 text-foreground">Experience</h3>
              <Button size="sm" variant="outline" onClick={addExperience} className="font-body text-xs gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            {experiences.map((exp, i) => (
              <div key={exp.id} className="space-y-3 border-t border-border pt-4 first:border-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">Position {i + 1}</span>
                  {experiences.length > 1 && (
                    <button onClick={() => removeExperience(exp.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="Job title" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} className="font-body bg-background" />
                  <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} className="font-body bg-background" />
                  <Input placeholder="Dates (e.g. Jan 2022 – Present)" value={exp.dates} onChange={(e) => updateExperience(exp.id, "dates", e.target.value)} className="font-body bg-background md:col-span-2" />
                </div>
                <Textarea placeholder="Key responsibilities and achievements" value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} className="font-body bg-background min-h-[60px]" />
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-700 text-foreground">Education</h3>
              <Button size="sm" variant="outline" onClick={addEducation} className="font-body text-xs gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            {educations.map((edu, i) => (
              <div key={edu.id} className="space-y-3 border-t border-border pt-4 first:border-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">Education {i + 1}</span>
                  {educations.length > 1 && (
                    <button onClick={() => removeEducation(edu.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} className="font-body bg-background" />
                  <Input placeholder="Degree / Qualification" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} className="font-body bg-background" />
                  <Input placeholder="Dates" value={edu.dates} onChange={(e) => updateEducation(edu.id, "dates", e.target.value)} className="font-body bg-background md:col-span-2" />
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="border border-border bg-card p-5 space-y-4">
            <h3 className="font-display font-700 text-foreground">Skills</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g. Python, Marketing, Figma)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="font-body bg-background"
              />
              <Button size="sm" variant="outline" onClick={addSkill} className="font-body text-xs shrink-0">Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs font-body gap-1 pr-1.5 cursor-pointer hover:bg-destructive/20" onClick={() => removeSkill(s)}>
                    {s} <span className="text-muted-foreground">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowPreview(true)} disabled={!hasContent} className="font-body gap-2">
              <FileText className="w-4 h-4" /> Preview CV
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateCoverLetter}
              disabled={!selectedRole || isGeneratingLetter}
              className="font-body gap-2"
            >
              {isGeneratingLetter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Generate Covering Letter
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start space-y-6">
          {showPreview && hasContent ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border bg-card p-6 md:p-8 space-y-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-700 text-primary text-sm uppercase tracking-widest">CV Preview</h3>
                <Button size="sm" variant="outline" className="font-body text-xs gap-1" onClick={() => window.print()}>
                  <Download className="w-3 h-3" /> Print / Save PDF
                </Button>
              </div>

              <div className="border-b border-border pb-4">
                <h2 className="font-display text-2xl font-800 text-foreground">{fullName || "Your Name"}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground font-body mt-1">
                  {email && <span>{email}</span>}
                  {phone && <span>{phone}</span>}
                  {location && <span>{location}</span>}
                  {linkedin && <span>{linkedin}</span>}
                </div>
              </div>

              {summary && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-1">Profile</h4>
                  <p className="text-sm font-body text-foreground leading-relaxed">{summary}</p>
                </div>
              )}

              {experiences.some((e) => e.title) && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Experience</h4>
                  <div className="space-y-3">
                    {experiences.filter((e) => e.title).map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-display font-600 text-foreground text-sm">{exp.title}</span>
                          <span className="text-xs text-muted-foreground font-body">{exp.dates}</span>
                        </div>
                        <p className="text-xs text-primary font-body">{exp.company}</p>
                        {exp.description && <p className="text-sm text-muted-foreground font-body mt-1 leading-relaxed">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {educations.some((e) => e.institution) && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Education</h4>
                  <div className="space-y-2">
                    {educations.filter((e) => e.institution).map((edu) => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-display font-600 text-foreground text-sm">{edu.degree}</span>
                          <p className="text-xs text-primary font-body">{edu.institution}</p>
                        </div>
                        <span className="text-xs text-muted-foreground font-body">{edu.dates}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs font-body">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedRole && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-1">Tailored for</h4>
                  <p className="text-sm font-body text-primary font-600">{selectedRole.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{selectedRole.salary}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="border border-dashed border-border p-8 md:p-12 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">
                Fill in your details and click <strong>Preview CV</strong> to see your CV here.
              </p>
            </div>
          )}

          {/* Cover Letter */}
          <AnimatePresence>
            {coverLetter && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="border border-border bg-card p-6 md:p-8 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-700 text-primary text-sm uppercase tracking-widest">Covering Letter</h3>
                  <Button size="sm" variant="outline" className="font-body text-xs gap-1" onClick={() => window.print()}>
                    <Download className="w-3 h-3" /> Print
                  </Button>
                </div>
                <div className="text-sm font-body text-foreground leading-relaxed whitespace-pre-line">
                  {coverLetter}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IndustryCVBuilder;
