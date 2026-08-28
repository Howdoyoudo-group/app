import { useCallback, useEffect, useMemo, useState } from "react";
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
  Loader2, Sparkles, Plus, Pencil, Trash2, ArrowUp, ArrowDown, X,
} from "lucide-react";
import { toast } from "sonner";
import CompanyLogo from "@/components/CompanyLogo";
import { INDUSTRIES } from "@/data/industries";

interface SpotlightRow {
  id: string;
  industry: string;
  company_name: string;
  rank: number;
  tagline: string | null;
  why_work_here: string[];
  url: string | null;
  logo_url: string | null;
  active: boolean;
}

const labelForSlug = (slug: string) =>
  INDUSTRIES.find((i) => i.slug === slug)?.name ??
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const emptyDraft = {
  id: null as string | null,
  industry: INDUSTRIES[0]?.slug ?? "",
  company_name: "",
  tagline: "",
  why_work_here: [] as string[],
  url: "",
  logo_url: "",
  active: true,
};

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

  useEffect(() => {
    document.title = "Employer Spotlight · Admin";
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pinned_industry_employers")
      .select("id, industry, company_name, rank, tagline, why_work_here, url, logo_url, active")
      .order("industry", { ascending: true })
      .order("rank", { ascending: true });
    setLoading(false);
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

  const openNew = () => {
    setDraft(emptyDraft);
    setBulletDraft("");
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
      active: row.active,
    });
    setBulletDraft("");
    setDialogOpen(true);
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
    await loadRows();
  };

  const remove = async (row: SpotlightRow) => {
    if (!confirm(`Remove the ${row.company_name} spotlight from ${labelForSlug(row.industry)}?`)) return;
    setBusyId(row.id);
    const { error } = await supabase.from("pinned_industry_employers").delete().eq("id", row.id);
    setBusyId(null);
    if (error) { toast.error(`Delete failed: ${error.message}`); return; }
    toast.success("Removed");
    await loadRows();
  };

  const toggleActive = async (row: SpotlightRow) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from("pinned_industry_employers")
      .update({ active: !row.active })
      .eq("id", row.id);
    setBusyId(null);
    if (error) { toast.error(`Update failed: ${error.message}`); return; }
    await loadRows();
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
    await loadRows();
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
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add spotlight
          </Button>
        </header>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            {allIndustryGroups.map(({ slug, name, list }) => (
              <div key={slug}>
                <h2 className="text-lg font-semibold mb-3">{name}</h2>
                {list.length === 0 ? (
                  <Card className="p-4 flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">No spotlight set for {name} yet.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setDraft({ ...emptyDraft, industry: slug }); setBulletDraft(""); setDialogOpen(true); }}
                    >
                      <Plus className="h-4 w-4" /> Add spotlight
                    </Button>
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
                onValueChange={(v) => setDraft((d) => ({ ...d, industry: v }))}
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
              <Label htmlFor="es-company">Company name</Label>
              <Input
                id="es-company"
                value={draft.company_name}
                onChange={(e) => setDraft((d) => ({ ...d, company_name: e.target.value }))}
                placeholder="e.g. Greggs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="es-tagline">Tagline</Label>
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
