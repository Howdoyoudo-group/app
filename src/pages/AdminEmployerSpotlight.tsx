import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2, Sparkles, Plus, Pencil, Trash2, ArrowUp, ArrowDown, X, Upload, Image as ImageIcon, Video,
} from "lucide-react";
import { toast } from "sonner";
import CompanyLogo from "@/components/CompanyLogo";
import { INDUSTRIES } from "@/data/industries";
import { ALL_COMPANIES_BY_INDUSTRY } from "@/data/all-companies";

// ALL_COMPANIES_BY_INDUSTRY (the same list that drives each industry page's
// own "Who" tab) isn't keyed by the canonical slug/name used everywhere
// else - it has its own historical naming. Bridge the two so picking a
// company here always uses the exact name the Who tab already renders,
// which is what makes CompanyProfileCard's pinned/hardcoded merge match up.
const SLUG_TO_COMPANIES_KEY: Record<string, string> = {
  cinema: "Film & TV",
  hospitality: "Food & Drink",
  "interior-design": "Home & Design",
};
const companiesKeyForSlug = (slug: string) =>
  SLUG_TO_COMPANIES_KEY[slug] ?? INDUSTRIES.find((i) => i.slug === slug)?.name ?? slug;

interface SpotlightRow {
  id: string;
  industry: string;
  company_name: string;
  rank: number;
  tagline: string | null;
  why_work_here: string[];
  url: string | null;
  logo_url: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
  active: boolean;
}

const labelForSlug = (slug: string) =>
  INDUSTRIES.find((i) => i.slug === slug)?.name ??
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const isFilled = (row: Pick<SpotlightRow, "tagline" | "why_work_here">) =>
  Boolean(row.tagline) && (row.why_work_here ?? []).length > 0;

const emptyDraft = {
  id: null as string | null,
  industry: INDUSTRIES[0]?.slug ?? "",
  company_name: "",
  tagline: "",
  why_work_here: [] as string[],
  url: "",
  logo_url: "",
  media_url: "",
  media_type: "image" as "image" | "video",
  active: true,
};

const slugifyForPath = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "spotlight";

export default function AdminEmployerSpotlight() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [rows, setRows] = useState<SpotlightRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Locks every row in an industry group while a reorder is in flight for
  // that group - prevents a second click landing on a row that just moved
  // to a new screen position after the first click's reload/re-sort.
  const [busyIndustry, setBusyIndustry] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [bulletDraft, setBulletDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [bulkFilling, setBulkFilling] = useState(false);
  // "Other" lets an admin type a company that isn't on the Who tab yet
  // (e.g. a brand new pin with no hardcoded profile). Starts true whenever
  // the current draft's company isn't one of the known candidates, so
  // editing an existing free-text pin doesn't clobber it back to a picker.
  const [manualCompany, setManualCompany] = useState(false);

  const companyCandidates = useMemo(
    () => ALL_COMPANIES_BY_INDUSTRY[companiesKeyForSlug(draft.industry)] ?? [],
    [draft.industry],
  );

  useEffect(() => {
    document.title = "Employer Spotlight · Admin";
  }, []);

  // `silent` skips the full-page loading spinner - used when refreshing
  // after an in-place action (delete, reorder, toggle, save) rather than the
  // initial mount. Swapping the whole grid out for a spinner and back again
  // collapses the page height mid-action, which is what was throwing the
  // scroll position back to the top after every delete/reorder.
  const loadRows = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const { data, error } = await supabase
      .from("pinned_industry_employers")
      .select("id, industry, company_name, rank, tagline, why_work_here, url, logo_url, media_url, media_type, active")
      .order("industry", { ascending: true })
      .order("rank", { ascending: true });
    if (!opts?.silent) setLoading(false);
    if (error) {
      toast.error(`Failed to load: ${error.message}`);
      return;
    }
    setRows((data ?? []) as SpotlightRow[]);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?redirect=/admin/employer-spotlight");
      return;
    }
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await loadRows();
    })();
  }, [user, authLoading, navigate, loadRows]);

  const rowsByIndustry = useMemo(() => {
    const map = new Map<string, SpotlightRow[]>();
    rows.forEach((r) => {
      const key = r.industry.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  // Every industry, always - not just the ones that happen to already have a
  // pinned row. Without this, an industry with zero spotlights (e.g. Estate
  // Agency) never appears on the page at all, which reads as "missing"
  // rather than "empty".
  const allIndustryGroups = useMemo(() => {
    const map = new Map(rowsByIndustry);
    return INDUSTRIES
      .map((i) => ({ slug: i.slug, name: i.name, list: map.get(i.slug) ?? [] }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rowsByIndustry]);

  const openNew = (industry?: string) => {
    setDraft(industry ? { ...emptyDraft, industry } : emptyDraft);
    setBulletDraft("");
    setManualCompany(false);
    setDialogOpen(true);
  };

  const openEdit = (row: SpotlightRow) => {
    setDraft({
      id: row.id,
      industry: row.industry,
      company_name: row.company_name,
      tagline: row.tagline ?? "",
      why_work_here: row.why_work_here ?? [],
      url: row.url ?? "",
      logo_url: row.logo_url ?? "",
      media_url: row.media_url ?? "",
      media_type: row.media_type ?? "image",
      active: row.active,
    });
    setBulletDraft("");
    const candidates = ALL_COMPANIES_BY_INDUSTRY[companiesKeyForSlug(row.industry)] ?? [];
    setManualCompany(!candidates.some((c) => c.name === row.company_name));
    setDialogOpen(true);
  };

  // Switching company on an existing spotlight (or mid-way through adding
  // one) previously only updated company_name - the tagline, bullets, logo
  // and media stayed exactly as they were for whichever company was there
  // before, so the visible name up top would change but everything below it
  // kept describing the old company. Content is company-specific, so any
  // company switch starts it fresh; id/industry/active (the slot itself)
  // are untouched.
  const clearedForNewCompany = (d: typeof emptyDraft, name: string, url = "") => ({
    ...d,
    company_name: name,
    url,
    tagline: "",
    why_work_here: [] as string[],
    logo_url: "",
    media_url: "",
    media_type: "image" as "image" | "video",
  });

  const selectCompanyCandidate = (name: string) => {
    const match = companyCandidates.find((c) => c.name === name);
    setDraft((d) => (name === d.company_name ? d : clearedForNewCompany(d, name, match?.url || "")));
  };

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMedia = async (file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Please choose an image or video file");
      return;
    }
    setUploadingMedia(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
    const path = `spotlight/${slugifyForPath(draft.industry)}-${slugifyForPath(draft.company_name)}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("company-assets")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    setUploadingMedia(false);
    if (upErr) {
      toast.error(`Upload failed: ${upErr.message}`);
      return;
    }
    const { data: pub } = supabase.storage.from("company-assets").getPublicUrl(path);
    setDraft((d) => ({ ...d, media_url: pub.publicUrl, media_type: isVideo ? "video" : "image" }));
    toast.success(`${isVideo ? "Video" : "Image"} uploaded`);
  };

  const addBullet = () => {
    const text = bulletDraft.trim();
    if (!text) return;
    if (draft.why_work_here.length >= 5) {
      toast.error("Max 5 bullet points - keep it scannable");
      return;
    }
    setDraft((d) => ({ ...d, why_work_here: [...d.why_work_here, text] }));
    setBulletDraft("");
  };

  const removeBullet = (idx: number) => {
    setDraft((d) => ({ ...d, why_work_here: d.why_work_here.filter((_, i) => i !== idx) }));
  };

  // Generates a tagline + why-work-here bullets for the row currently open
  // in the dialog. Existing rows (draft.id set) get saved straight to the
  // DB by the function and we just mirror that into the draft; brand-new,
  // not-yet-saved spotlights have no row to write to, so the function only
  // returns the content and we drop it into the draft for the admin to
  // review before hitting Save.
  const autoFillDraft = async () => {
    if (!draft.company_name.trim()) {
      toast.error("Pick or enter a company first");
      return;
    }
    setAutoFilling(true);
    const { data, error } = await supabase.functions.invoke("generate-spotlight-content", {
      body: draft.id
        ? { id: draft.id, force: true }
        : { company_name: draft.company_name.trim(), industry: draft.industry },
    });
    setAutoFilling(false);
    if (error || data?.error) {
      toast.error(`Auto-fill failed: ${data?.error ?? error?.message}`);
      return;
    }
    setDraft((d) => ({ ...d, tagline: data.tagline, why_work_here: data.why_work_here }));
    toast.success("Filled in with AI - review before saving");
  };

  // One-click pass over every spotlight that's missing a tagline or bullets,
  // so existing pins don't all need opening and auto-filling one at a time.
  const bulkAutoFill = async () => {
    const targets = rows.filter((r) => !isFilled(r));
    if (targets.length === 0) {
      toast.success("Every spotlight already has content");
      return;
    }
    if (!confirm(`Auto-fill ${targets.length} spotlight${targets.length === 1 ? "" : "s"} that are missing a tagline or "why work here" bullets?`)) return;
    setBulkFilling(true);
    let ok = 0, failed = 0;
    for (const row of targets) {
      const { data, error } = await supabase.functions.invoke("generate-spotlight-content", { body: { id: row.id } });
      if (error || data?.error) failed += 1; else ok += 1;
    }
    setBulkFilling(false);
    await loadRows({ silent: true });
    if (failed === 0) toast.success(`Filled in ${ok} spotlight${ok === 1 ? "" : "s"}`);
    else toast.error(`Filled in ${ok}, ${failed} failed - try those individually`);
  };

  const save = async () => {
    if (!draft.industry || !draft.company_name.trim()) {
      toast.error("Industry and company name are required");
      return;
    }
    if (draft.url && !/^https?:\/\//i.test(draft.url.trim())) {
      toast.error("Careers URL must start with http:// or https://");
      return;
    }
    setSaving(true);
    const payload = {
      industry: draft.industry,
      company_name: draft.company_name.trim(),
      tagline: draft.tagline.trim() || null,
      why_work_here: draft.why_work_here,
      url: draft.url.trim() || null,
      logo_url: draft.logo_url.trim() || null,
      media_url: draft.media_url.trim() || null,
      media_type: draft.media_url.trim() ? draft.media_type : null,
      active: draft.active,
    };

    if (draft.id) {
      const { error } = await supabase
        .from("pinned_industry_employers")
        .update(payload)
        .eq("id", draft.id);
      setSaving(false);
      if (error) { toast.error(`Save failed: ${error.message}`); return; }
      toast.success("Spotlight updated");
    } else {
      // New pin goes to the back of the queue for its industry (max rank + 1).
      const { data: existing } = await supabase
        .from("pinned_industry_employers")
        .select("rank")
        .ilike("industry", draft.industry)
        .order("rank", { ascending: false })
        .limit(1);
      const nextRank = existing && existing.length ? (existing[0].rank ?? 0) + 1 : 0;
      const { error } = await supabase
        .from("pinned_industry_employers")
        .insert({ ...payload, rank: nextRank });
      setSaving(false);
      if (error) {
        toast.error(
          error.message.includes("duplicate")
            ? "This company is already pinned for that industry - edit the existing entry instead."
            : `Save failed: ${error.message}`
        );
        return;
      }
      toast.success("Spotlight added");
    }
    setDialogOpen(false);
    await loadRows({ silent: true });
  };

  const remove = async (row: SpotlightRow) => {
    if (!confirm(`Remove the ${row.company_name} spotlight from ${labelForSlug(row.industry)}?`)) return;
    setBusyId(row.id);
    const { error } = await supabase.from("pinned_industry_employers").delete().eq("id", row.id);
    setBusyId(null);
    if (error) { toast.error(`Delete failed: ${error.message}`); return; }
    toast.success("Removed");
    await loadRows({ silent: true });
  };

  const toggleActive = async (row: SpotlightRow) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from("pinned_industry_employers")
      .update({ active: !row.active })
      .eq("id", row.id);
    setBusyId(null);
    if (error) { toast.error(`Update failed: ${error.message}`); return; }
    await loadRows({ silent: true });
  };

  // Swaps a row with its immediate neighbour in the *currently displayed*
  // sort order for that industry, rather than blindly adding/subtracting
  // from its rank. A plain +/-1 bump can create rank ties (as happened live -
  // Dr. Martens and Vans both sitting at rank 6) and, combined with an
  // immediate reload, moves the whole list under the user's cursor between
  // clicks. Swapping two concrete rank values and locking the whole
  // industry group while it's in flight avoids both problems.
  const bumpRank = async (row: SpotlightRow, direction: -1 | 1) => {
    const group = rowsByIndustry.find(([slug]) => slug === row.industry.toLowerCase())?.[1] ?? [];
    const idx = group.findIndex((r) => r.id === row.id);
    const neighbour = group[idx + direction];
    if (!neighbour) return; // already first/last - nothing to swap with

    setBusyIndustry(row.industry);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("pinned_industry_employers").update({ rank: neighbour.rank }).eq("id", row.id),
      supabase.from("pinned_industry_employers").update({ rank: row.rank }).eq("id", neighbour.id),
    ]);
    setBusyIndustry(null);
    if (e1 || e2) { toast.error(`Reorder failed: ${(e1 ?? e2)?.message}`); return; }
    await loadRows({ silent: true });
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Admins only</h1>
          <p className="text-muted-foreground">You don't have access to this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" /> Employer Spotlight
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Choose which company gets the promoted tile on each industry's job marketplace, and write its content -
              tagline, "why work here" bullets, and the careers link. Only one spotlight shows per industry at a
              time (the lowest rank, active row wins); reorder with the arrows to change who's currently featured.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={bulkAutoFill} disabled={bulkFilling}>
              {bulkFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Auto-fill all empty
            </Button>
            <Button onClick={() => openNew()}>
              <Plus className="h-4 w-4" /> Add spotlight
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            {allIndustryGroups.map(({ slug, name, list }) => (
              <div key={slug}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-semibold">{name}</h2>
                  {/* Always visible, even once this industry already has spotlights -
                      previously this button only existed in the empty state, so the
                      only way to add another option once one existed was the generic
                      top-of-page button, which doesn't default to this industry. */}
                  <Button size="sm" variant="outline" onClick={() => openNew(slug)}>
                    <Plus className="h-4 w-4" /> Add spotlight
                  </Button>
                </div>
                {list.length === 0 ? (
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">No spotlight set for {name} yet.</p>
                  </Card>
                ) : (
                <div className="grid gap-3">
                  {list.map((row) => (
                    <Card key={row.id} className={`p-4 flex items-start gap-4 ${!row.active ? "opacity-50" : ""}`}>
                      <CompanyLogo company={row.company_name} size={44} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{row.company_name}</h3>
                          <span className="text-xs text-muted-foreground">rank {row.rank}</span>
                          {!row.active && (
                            <span className="text-xs font-bold uppercase tracking-wide text-destructive">Inactive</span>
                          )}
                        </div>
                        {row.tagline && <p className="text-sm text-muted-foreground mt-0.5">{row.tagline}</p>}
                        {row.why_work_here?.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {row.why_work_here.map((point, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => bumpRank(row, -1)} disabled={busyId === row.id || busyIndustry === row.industry} aria-label="Move up">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => bumpRank(row, 1)} disabled={busyId === row.id || busyIndustry === row.industry} aria-label="Move down">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Switch checked={row.active} onCheckedChange={() => toggleActive(row)} disabled={busyId === row.id || busyIndustry === row.industry} />
                        <Button size="icon" variant="ghost" onClick={() => openEdit(row)} disabled={busyIndustry === row.industry} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(row)} disabled={busyId === row.id || busyIndustry === row.industry} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit spotlight" : "Add spotlight"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Industry</Label>
              <Select
                value={draft.industry}
                onValueChange={(v) => {
                  setDraft((d) => ({ ...d, industry: v, company_name: "", url: "" }));
                  setManualCompany(false);
                }}
                disabled={!!draft.id}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72" position="item-aligned">
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i.slug} value={i.slug}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {draft.id && (
                <p className="text-xs text-muted-foreground">Remove and re-add to move a spotlight to a different industry.</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="es-company">Company</Label>
              {companyCandidates.length > 0 && !manualCompany ? (
                <>
                  <Select
                    value={draft.company_name || undefined}
                    onValueChange={(v) => {
                      if (v === "__other__") { setManualCompany(true); setDraft((d) => clearedForNewCompany(d, "")); }
                      else selectCompanyCandidate(v);
                    }}
                  >
                    <SelectTrigger id="es-company"><SelectValue placeholder="Pick a company from the Who tab…" /></SelectTrigger>
                    <SelectContent className="max-h-72" position="item-aligned">
                      {companyCandidates.map((c) => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))}
                      <SelectItem value="__other__">Other (type manually)…</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Picking from this list keeps the spotlight name matched to the same company's card on the Who tab.
                  </p>
                </>
              ) : (
                <>
                  <Input
                    id="es-company"
                    value={draft.company_name}
                    onChange={(e) => setDraft((d) => ({ ...d, company_name: e.target.value }))}
                    placeholder="e.g. Greggs"
                  />
                  {companyCandidates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setManualCompany(false); setDraft((d) => ({ ...d, company_name: "" })); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Pick from the Who tab list instead
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="es-tagline">Tagline</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={autoFillDraft}
                  disabled={autoFilling || !draft.company_name.trim()}
                  className="h-7 px-2 text-xs"
                >
                  {autoFilling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Auto-fill with AI
                </Button>
              </div>
              <Textarea
                id="es-tagline"
                value={draft.tagline}
                onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
                placeholder="One line under the company name on the tile."
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <Label>Why work here (up to 5 bullets)</Label>
              {draft.why_work_here.length > 0 && (
                <ul className="space-y-1.5 mb-2">
                  {draft.why_work_here.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm border rounded-md px-2.5 py-1.5">
                      <span className="flex-1">{point}</span>
                      <button type="button" onClick={() => removeBullet(i)} aria-label="Remove bullet">
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {draft.why_work_here.length < 5 && (
                <div className="flex gap-2">
                  <Input
                    value={bulletDraft}
                    onChange={(e) => setBulletDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBullet(); } }}
                    placeholder="Add a bullet point…"
                  />
                  <Button type="button" variant="outline" onClick={addBullet}>Add</Button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="es-url">Careers URL</Label>
              <Input
                id="es-url"
                type="url"
                value={draft.url}
                onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                placeholder="https://…"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="es-logo">Logo URL (optional)</Label>
              <Input
                id="es-logo"
                type="url"
                value={draft.logo_url}
                onChange={(e) => setDraft((d) => ({ ...d, logo_url: e.target.value }))}
                placeholder="Leave blank to use the automatic company logo lookup"
              />
            </div>

            <div className="space-y-2 border rounded-md p-3">
              <Label>Banner image or video (optional)</Label>
              <p className="text-xs text-muted-foreground">
                Replaces the plain colour band with the employer's own creative on the tile.
                Upload a file or paste a link (an image, a direct video file, or a YouTube/Vimeo link).
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={draft.media_type === "image" ? "default" : "outline"}
                  onClick={() => setDraft((d) => ({ ...d, media_type: "image" }))}
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1" /> Image
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={draft.media_type === "video" ? "default" : "outline"}
                  onClick={() => setDraft((d) => ({ ...d, media_type: "video" }))}
                >
                  <Video className="h-3.5 w-3.5 mr-1" /> Video
                </Button>
              </div>
              <Input
                type="url"
                value={draft.media_url}
                onChange={(e) => setDraft((d) => ({ ...d, media_url: e.target.value }))}
                placeholder={draft.media_type === "video" ? "https://youtube.com/watch?v=… or a direct video link" : "https://…"}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept={draft.media_type === "video" ? "video/*" : "image/*"}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadMedia(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploadingMedia}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingMedia ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                {uploadingMedia ? "Uploading…" : "Upload a file instead"}
              </Button>
              {draft.media_url && (
                <div className="flex items-center gap-2 pt-1">
                  {draft.media_type === "video" ? (
                    <span className="text-xs text-muted-foreground">Video set - preview on the live tile.</span>
                  ) : (
                    <img
                      src={draft.media_url}
                      alt="Spotlight media preview"
                      className="h-16 w-28 object-cover rounded border"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, media_url: "" }))}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={draft.active} onCheckedChange={(v) => setDraft((d) => ({ ...d, active: v }))} />
              <Label className="mb-0">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {draft.id ? "Save changes" : "Add spotlight"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
