import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, Plus, Trash2, ExternalLink, Save } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  companyId: string;
  companySlug: string;
  companyName: string;
}

interface ProfileRow {
  id?: string;
  company_id: string;
  tagline: string | null;
  about: string | null;
  mission: string | null;
  culture: string | null;
  perks: string[] | null;
  locations: string[] | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  careers_url: string | null;
  instagram_url: string | null;
  press_mentions: { title: string; url: string }[] | null;
  awards: { title: string; year?: string }[] | null;
  sustainability: string | null;
  custom_blocks: { heading: string; body: string }[] | null;
}

const empty = (companyId: string): ProfileRow => ({
  company_id: companyId,
  tagline: "",
  about: "",
  mission: "",
  culture: "",
  perks: [],
  locations: [],
  logo_url: null,
  cover_image_url: null,
  website_url: "",
  linkedin_url: "",
  careers_url: "",
  instagram_url: "",
  press_mentions: [],
  awards: [],
  sustainability: "",
  custom_blocks: [],
});

const CompanyProfileEditor = ({ companyId, companySlug, companyName }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileRow>(empty(companyId));
  const [perksInput, setPerksInput] = useState("");
  const [locationsInput, setLocationsInput] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();
      if (data) {
        setProfile({ ...empty(companyId), ...(data as any) } as ProfileRow);
        setPerksInput((data.perks ?? []).join(", "));
        setLocationsInput((data.locations ?? []).join(", "));
      } else {
        setProfile(empty(companyId));
        setPerksInput("");
        setLocationsInput("");
      }
      setLoading(false);
    };
    load();
  }, [companyId]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...profile,
      company_id: companyId,
      perks: perksInput.split(",").map((s) => s.trim()).filter(Boolean),
      locations: locationsInput.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const { data, error } = await supabase
      .from("company_profiles")
      .upsert(payload, { onConflict: "company_id" })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfile({ ...empty(companyId), ...(data as any) } as ProfileRow);
    toast.success("Profile saved - live now.");
  };

  const uploadImage = async (file: File, kind: "logo" | "cover") => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${companySlug}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("company-assets")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("company-assets").getPublicUrl(path);
    const url = pub.publicUrl;
    setProfile((p) => ({ ...p, [kind === "logo" ? "logo_url" : "cover_image_url"]: url }));
    toast.success(`${kind === "logo" ? "Logo" : "Cover image"} uploaded - remember to Save.`);
  };

  return (
    <div className="border-2 border-foreground bg-background mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5" strokeWidth={3} />
          <div className="text-left">
            <div className="font-display text-lg uppercase tracking-wide">Company profile</div>
            <div className="text-xs text-muted-foreground">
              Edit your public brand page · /company/{companySlug}
            </div>
          </div>
        </div>
        <span className="text-xs font-bold uppercase">{open ? "Close" : "Edit"}</span>
      </button>

      {open && (
        <div className="px-4 pb-6 pt-2 border-t-2 border-foreground space-y-6">
          {loading ? (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {/* Image uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageField
                  label="Logo"
                  url={profile.logo_url}
                  onUpload={(f) => uploadImage(f, "logo")}
                  onClear={() => setProfile((p) => ({ ...p, logo_url: null }))}
                />
                <ImageField
                  label="Cover image (wide)"
                  url={profile.cover_image_url}
                  onUpload={(f) => uploadImage(f, "cover")}
                  onClear={() => setProfile((p) => ({ ...p, cover_image_url: null }))}
                />
              </div>

              {/* Editorial basics */}
              <Section title="Editorial">
                <Field label="Tagline">
                  <input
                    value={profile.tagline ?? ""}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    className="w-full border-2 border-foreground bg-background px-3 py-2"
                    placeholder={`What ${companyName} is in one line`}
                  />
                </Field>
                <Field label="About">
                  <textarea
                    value={profile.about ?? ""}
                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                    rows={5}
                    className="w-full border-2 border-foreground bg-background px-3 py-2"
                  />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Mission">
                    <textarea
                      value={profile.mission ?? ""}
                      onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
                      rows={3}
                      className="w-full border-2 border-foreground bg-background px-3 py-2"
                    />
                  </Field>
                  <Field label="Culture">
                    <textarea
                      value={profile.culture ?? ""}
                      onChange={(e) => setProfile({ ...profile, culture: e.target.value })}
                      rows={3}
                      className="w-full border-2 border-foreground bg-background px-3 py-2"
                    />
                  </Field>
                </div>
                <Field label="Perks (comma-separated)">
                  <input
                    value={perksInput}
                    onChange={(e) => setPerksInput(e.target.value)}
                    className="w-full border-2 border-foreground bg-background px-3 py-2"
                    placeholder="Free food, hybrid working, equity…"
                  />
                </Field>
                <Field label="Locations (comma-separated)">
                  <input
                    value={locationsInput}
                    onChange={(e) => setLocationsInput(e.target.value)}
                    className="w-full border-2 border-foreground bg-background px-3 py-2"
                    placeholder="London, Manchester, Remote UK"
                  />
                </Field>
              </Section>

              {/* External links */}
              <Section title="External links">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Website"><LinkInput value={profile.website_url} onChange={(v) => setProfile({ ...profile, website_url: v })} /></Field>
                  <Field label="LinkedIn"><LinkInput value={profile.linkedin_url} onChange={(v) => setProfile({ ...profile, linkedin_url: v })} /></Field>
                  <Field label="Careers page"><LinkInput value={profile.careers_url} onChange={(v) => setProfile({ ...profile, careers_url: v })} /></Field>
                  <Field label="Instagram"><LinkInput value={profile.instagram_url} onChange={(v) => setProfile({ ...profile, instagram_url: v })} /></Field>
                </div>
              </Section>

              {/* Rich extras */}
              <Section title="Press & awards">
                <RepeatableList
                  items={profile.press_mentions ?? []}
                  onChange={(items) => setProfile({ ...profile, press_mentions: items as any })}
                  fields={[
                    { key: "title", placeholder: "Article title" },
                    { key: "url", placeholder: "https://…" },
                  ]}
                  addLabel="Add press mention"
                />
                <div className="mt-4">
                  <RepeatableList
                    items={profile.awards ?? []}
                    onChange={(items) => setProfile({ ...profile, awards: items as any })}
                    fields={[
                      { key: "title", placeholder: "Award name" },
                      { key: "year", placeholder: "Year" },
                    ]}
                    addLabel="Add award"
                  />
                </div>
              </Section>

              <Section title="Sustainability">
                <textarea
                  value={profile.sustainability ?? ""}
                  onChange={(e) => setProfile({ ...profile, sustainability: e.target.value })}
                  rows={4}
                  className="w-full border-2 border-foreground bg-background px-3 py-2"
                  placeholder="ESG commitments, certifications, initiatives…"
                />
              </Section>

              <Section title="Custom blocks">
                <RepeatableList
                  items={profile.custom_blocks ?? []}
                  onChange={(items) => setProfile({ ...profile, custom_blocks: items as any })}
                  fields={[
                    { key: "heading", placeholder: "Heading" },
                    { key: "body", placeholder: "Content", multiline: true },
                  ]}
                  addLabel="Add block"
                />
              </Section>

              {/* Save bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t-2 border-dashed border-foreground/40">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase border-2 border-foreground bg-primary hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
                <Link
                  to={`/company/${companySlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase border-2 border-foreground bg-background px-3 py-2 hover:bg-muted"
                >
                  <ExternalLink className="w-3 h-3" /> View public page
                </Link>
                <span className="text-xs text-muted-foreground italic">Saves go live immediately.</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[11px] font-bold uppercase tracking-wide mb-1">{label}</span>
    {children}
  </label>
);

const LinkInput = ({ value, onChange }: { value: string | null; onChange: (v: string) => void }) => (
  <input
    type="url"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder="https://…"
    className="w-full border-2 border-foreground bg-background px-3 py-2"
  />
);

const ImageField = ({
  label,
  url,
  onUpload,
  onClear,
}: {
  label: string;
  url: string | null;
  onUpload: (file: File) => void;
  onClear: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="block text-[11px] font-bold uppercase tracking-wide mb-1">{label}</span>
      <div className="border-2 border-foreground bg-background p-3 flex items-center gap-3">
        <div className="w-20 h-20 border-2 border-foreground bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {url ? (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-xs"
          />
          {url && (
            <button
              onClick={onClear}
              type="button"
              className="self-start text-[11px] font-bold uppercase text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface RepeatableListProps {
  items: Record<string, string>[];
  onChange: (items: Record<string, string>[]) => void;
  fields: { key: string; placeholder: string; multiline?: boolean }[];
  addLabel: string;
}

const RepeatableList = ({ items, onChange, fields, addLabel }: RepeatableListProps) => {
  const update = (idx: number, key: string, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {})]);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="border-2 border-dashed border-foreground/40 p-2 flex items-start gap-2">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            {fields.map((f) =>
              f.multiline ? (
                <textarea
                  key={f.key}
                  value={item[f.key] ?? ""}
                  onChange={(e) => update(idx, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  className="w-full border border-foreground bg-background px-2 py-1 text-sm md:col-span-2"
                />
              ) : (
                <input
                  key={f.key}
                  value={item[f.key] ?? ""}
                  onChange={(e) => update(idx, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-foreground bg-background px-2 py-1 text-sm"
                />
              )
            )}
          </div>
          <button
            onClick={() => remove(idx)}
            type="button"
            className="text-muted-foreground hover:text-destructive p-1"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        type="button"
        className="inline-flex items-center gap-1 text-xs font-bold uppercase border-2 border-foreground bg-background px-3 py-1.5 hover:bg-muted"
      >
        <Plus className="w-3 h-3" /> {addLabel}
      </button>
    </div>
  );
};

export default CompanyProfileEditor;
