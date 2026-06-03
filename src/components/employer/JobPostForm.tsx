import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Briefcase, Loader2, Plus, Sparkles, X } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";

interface JobPostFormProps {
  companyId: string;
  companyName: string;
  companyIndustry: string | null;
  posterUserId: string;
  onPosted?: () => void;
}

const jobSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(140),
  location: z.string().trim().min(2, "Location is required").max(120),
  workMode: z.enum(["On-site", "Hybrid", "Remote"]),
  type: z.enum(["Full-time", "Part-time", "Contract", "Freelance", "Internship"]),
  careerLevel: z.enum(["entry", "mid", "senior", "executive"]),
  salary: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().min(20, "Add at least a short description").max(5000),
  url: z.string().trim().url("Application URL must be a valid link").max(500),
  featured: z.boolean(),
});

type FormState = z.infer<typeof jobSchema>;

const initialState: FormState = {
  title: "",
  location: "",
  workMode: "On-site",
  type: "Full-time",
  careerLevel: "mid",
  salary: "",
  description: "",
  url: "",
  featured: false,
};

const fieldLabel = "block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-foreground";
const fieldInput =
  "w-full border-2 border-foreground bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary";

const JobPostForm = ({
  companyId,
  companyName,
  companyIndustry,
  posterUserId,
  onPosted,
}: JobPostFormProps) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = jobSchema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first ?? "Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("jobs").insert({
        title: parsed.data.title,
        company: companyName,
        location: parsed.data.location,
        work_mode: parsed.data.workMode,
        type: parsed.data.type,
        career_level: parsed.data.careerLevel,
        salary: parsed.data.salary || null,
        description: parsed.data.description,
        url: parsed.data.url,
        source_url: parsed.data.url,
        industry: companyIndustry,
        featured: parsed.data.featured,
        posted_by: posterUserId,
      });
      if (error) throw error;
      toast.success(
        parsed.data.featured
          ? "Job posted as a Premium listing - it will be pinned to the top of the marketplace."
          : "Job posted to the marketplace."
      );
      setForm(initialState);
      setOpen(false);
      onPosted?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Could not post the job. Please try again.");
    } finally {
      setSubmitting(false);
    }
    void companyId; // referenced for future scoping/audit
  };

  if (!open) {
    return (
      <div className="mb-6 border-2 border-foreground bg-primary/10 shadow-[6px_6px_0_hsl(var(--foreground))] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <CompanyLogo company={companyName} size={56} />
          <div>
            <div className="font-display text-lg uppercase tracking-wide flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" strokeWidth={3} />
              Post a job
            </div>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Add a new listing to the marketplace for <span className="font-bold">{companyName}</span>. Choose Premium to pin it to the top.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-primary text-foreground border-2 border-foreground px-5 py-3 font-display text-sm uppercase tracking-wide shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          New listing
        </button>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground bg-background shadow-[6px_6px_0_hsl(var(--foreground))] mb-6">
      <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-muted/40">
        <div className="font-display text-sm uppercase tracking-wide flex items-center gap-3">
          <CompanyLogo company={companyName} size={32} />
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={3} />
            New job listing - {companyName}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="p-1 hover:text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={fieldLabel}>Job title *</label>
          <input
            className={fieldInput}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Senior Brand Marketing Manager"
            maxLength={140}
            required
          />
        </div>

        <div>
          <label className={fieldLabel}>Location *</label>
          <input
            className={fieldInput}
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="London, Manchester, etc."
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className={fieldLabel}>Salary range</label>
          <input
            className={fieldInput}
            value={form.salary}
            onChange={(e) => update("salary", e.target.value)}
            placeholder="£45k–£55k (optional)"
            maxLength={80}
          />
        </div>

        <div>
          <label className={fieldLabel}>Work mode *</label>
          <select
            className={fieldInput}
            value={form.workMode}
            onChange={(e) => update("workMode", e.target.value as FormState["workMode"])}
          >
            <option>On-site</option>
            <option>Hybrid</option>
            <option>Remote</option>
          </select>
        </div>

        <div>
          <label className={fieldLabel}>Employment type *</label>
          <select
            className={fieldInput}
            value={form.type}
            onChange={(e) => update("type", e.target.value as FormState["type"])}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Freelance</option>
            <option>Internship</option>
          </select>
        </div>

        <div>
          <label className={fieldLabel}>Career level *</label>
          <select
            className={fieldInput}
            value={form.careerLevel}
            onChange={(e) => update("careerLevel", e.target.value as FormState["careerLevel"])}
          >
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div>
          <label className={fieldLabel}>Application URL *</label>
          <input
            type="url"
            className={fieldInput}
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://yourcompany.com/careers/..."
            maxLength={500}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={fieldLabel}>Job description *</label>
          <textarea
            className={`${fieldInput} min-h-[140px] resize-y`}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the role, responsibilities, and what you're looking for…"
            maxLength={5000}
            required
          />
          <p className="mt-1 text-[11px] text-muted-foreground font-body">
            {form.description.length}/5000 characters
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-start gap-3 border-2 border-foreground bg-primary/10 p-4 cursor-pointer hover:bg-primary/20 transition-colors">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="mt-1 w-5 h-5 accent-primary cursor-pointer"
            />
            <div>
              <div className="font-display text-sm uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" strokeWidth={3} />
                Premium listing
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Pinned to the top of the marketplace and shown in the dedicated{" "}
                <span className="font-bold">Premium</span> tab. Recommended for hard-to-fill roles
                and headline campaigns.
              </p>
            </div>
          </label>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setForm(initialState);
              setOpen(false);
            }}
            className="text-sm font-bold uppercase tracking-wide hover:text-primary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-primary text-foreground border-2 border-foreground px-5 py-2.5 font-display text-xs uppercase tracking-wide shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Posting…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" strokeWidth={3} />
                {form.featured ? "Post premium listing" : "Post job"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostForm;
