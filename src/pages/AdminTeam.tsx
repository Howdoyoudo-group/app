import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2, FileText, Users, Activity, DollarSign, Briefcase,
  ExternalLink, Download, Video, Upload, Trash2, Palette, BarChart3, Copy,
  FolderPlus, Plus, Folder, Sparkles, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const SUPABASE_PUBLIC = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/team-assets";
const BRAND_KIT_URL = `${SUPABASE_PUBLIC}/brand/howdoyoudo-brand-kit.zip`;

interface TeamDoc {
  id: string;
  folder: string;
  title: string;
  description: string | null;
  url: string;
  sort_order: number;
}

const ADMIN_LINKS = [
  { title: "Site Statistics", description: "Owner insights dashboard (Howdoyoudo employer view).", to: "/employer-dashboard", icon: BarChart3 },
  { title: "Users", description: "Manage users, premium status, admin roles.", to: "/admin/users", icon: Users },
  { title: "Industry Health", description: "Live job counts and feed monitoring.", to: "/admin/industry-health", icon: Activity },
  { title: "Adzuna Runs", description: "Inspect Adzuna ingestion logs and throttling.", to: "/admin/adzuna-runs", icon: Briefcase },
  { title: "AI Costs", description: "Track Lovable AI usage and spend.", to: "/admin/ai-costs", icon: DollarSign },
  { title: "Employer Spotlight", description: "Choose the promoted company per industry and write its tile content.", to: "/admin/employer-spotlight", icon: Sparkles },
  { title: "Platform Stats", description: "Real (bot-filtered) job clicks and site-wide engagement.", to: "/admin/site-stats", icon: TrendingUp },
];

interface VideoFile {
  name: string;
  size: number;
  updatedAt: string | null;
  url: string;
}

export default function AdminTeam() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<TeamDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docDraft, setDocDraft] = useState({ folder: "", title: "", description: "", url: "" });

  useEffect(() => {
    document.title = "Team Hub · Admin";
  }, []);

  const loadVideos = useCallback(async () => {
    setLoadingVideos(true);
    const { data, error } = await supabase.storage
      .from("team-assets")
      .list("videos", { limit: 100, sortBy: { column: "updated_at", order: "desc" } });
    if (error) {
      toast.error(`Failed to load videos: ${error.message}`);
      setVideos([]);
    } else {
      setVideos(
        (data ?? [])
          .filter((f) => f.name && !f.name.startsWith("."))
          .map((f) => ({
            name: f.name,
            size: (f.metadata as { size?: number } | null)?.size ?? 0,
            updatedAt: f.updated_at ?? null,
            url: `${SUPABASE_PUBLIC}/videos/${encodeURIComponent(f.name)}`,
          })),
      );
    }
    setLoadingVideos(false);
  }, []);

  const loadDocs = useCallback(async () => {
    setLoadingDocs(true);
    const { data, error } = await (supabase as any)
      .from("team_docs")
      .select("*")
      .order("folder", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error(`Failed to load documents: ${error.message}`);
    else setDocs((data ?? []) as TeamDoc[]);
    setLoadingDocs(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?redirect=/admin/team");
      return;
    }
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) {
        await Promise.all([loadVideos(), loadDocs()]);
      }
    })();
  }, [user, authLoading, navigate, loadVideos, loadDocs]);

  const folders = useMemo(() => {
    const set = new Set(docs.map((d) => d.folder));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [docs]);

  const docsByFolder = useMemo(() => {
    const map: Record<string, TeamDoc[]> = {};
    folders.forEach((f) => (map[f] = []));
    docs.forEach((d) => {
      (map[d.folder] ||= []).push(d);
    });
    return map;
  }, [docs, folders]);

  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    if (folders.includes(name)) {
      toast.error("Folder already exists");
      return;
    }
    // Create folder by inserting a placeholder doc? Better: create the folder by opening doc dialog pre-filled.
    setNewFolderName("");
    setFolderDialogOpen(false);
    setDocDraft({ folder: name, title: "", description: "", url: "" });
    setDocDialogOpen(true);
    toast.info(`Add the first document to "${name}"`);
  };

  const saveDoc = async () => {
    const { folder, title, url } = docDraft;
    if (!folder.trim() || !title.trim() || !url.trim()) {
      toast.error("Folder, title and URL are required");
      return;
    }
    const { error } = await (supabase as any).from("team_docs").insert({
      folder: folder.trim(),
      title: title.trim(),
      description: docDraft.description.trim() || null,
      url: url.trim(),
      created_by: user?.id ?? null,
    });
    if (error) {
      toast.error(`Failed to save: ${error.message}`);
      return;
    }
    toast.success("Document added");
    setDocDialogOpen(false);
    setDocDraft({ folder: "", title: "", description: "", url: "" });
    await loadDocs();
  };

  const deleteDoc = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await (supabase as any).from("team_docs").delete().eq("id", id);
    if (error) toast.error(`Delete failed: ${error.message}`);
    else {
      toast.success("Deleted");
      await loadDocs();
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `videos/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("team-assets")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) toast.error(`Upload failed: ${error.message}`);
    else {
      toast.success(`Uploaded ${file.name}`);
      await loadVideos();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage
      .from("team-assets")
      .remove([`videos/${name}`]);
    if (error) toast.error(`Delete failed: ${error.message}`);
    else {
      toast.success("Deleted");
      setVideos((v) => v.filter((x) => x.name !== name));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
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
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Team Hub</h1>
          <p className="text-muted-foreground mt-2">
            Shared workspace for the HDYD team — docs, brand assets, videos and admin tools.
          </p>
        </header>

        {/* Docs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h2 className="text-xl font-semibold">Project documents</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setNewFolderName(""); setFolderDialogOpen(true); }}
              >
                <FolderPlus className="h-4 w-4" /> New folder
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setDocDraft({ folder: folders[0] ?? "General", title: "", description: "", url: "" });
                  setDocDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add document
              </Button>
            </div>
          </div>

          {loadingDocs ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : folders.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No folders yet. Create a folder to start adding documents.
            </Card>
          ) : (
            <div className="space-y-8">
              {folders.map((folder) => (
                <div key={folder}>
                  <div className="flex items-center gap-2 mb-3">
                    <Folder className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{folder}</h3>
                    <span className="text-xs text-muted-foreground">({docsByFolder[folder].length})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => {
                        setDocDraft({ folder, title: "", description: "", url: "" });
                        setDocDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {docsByFolder[folder].map((doc) => (
                      <Card key={doc.id} className="p-5 h-full transition-colors hover:border-primary/60 group relative">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex items-center gap-1">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" aria-label="Open">
                              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </a>
                            <button
                              onClick={() => deleteDoc(doc.id, doc.title)}
                              aria-label="Delete"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block">
                          <h4 className="font-semibold mb-1 hover:underline">{doc.title}</h4>
                          {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
                        </a>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* New folder dialog */}
        <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Episode 3"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                You'll add the first document next.
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
              <Button onClick={createFolder}>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add document dialog */}
        <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add document</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="doc-folder">Folder</Label>
                <Input
                  id="doc-folder"
                  list="existing-folders"
                  value={docDraft.folder}
                  onChange={(e) => setDocDraft({ ...docDraft, folder: e.target.value })}
                  placeholder="Folder name"
                />
                <datalist id="existing-folders">
                  {folders.map((f) => <option key={f} value={f} />)}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label htmlFor="doc-title">Title</Label>
                <Input
                  id="doc-title"
                  value={docDraft.title}
                  onChange={(e) => setDocDraft({ ...docDraft, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="doc-url">URL</Label>
                <Input
                  id="doc-url"
                  type="url"
                  value={docDraft.url}
                  onChange={(e) => setDocDraft({ ...docDraft, url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="doc-desc">Description (optional)</Label>
                <Input
                  id="doc-desc"
                  value={docDraft.description}
                  onChange={(e) => setDocDraft({ ...docDraft, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDocDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveDoc}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Brand assets */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Brand assets</h2>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex gap-3">
                <Palette className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Howdoyoudo Brand Kit</h3>
                  <p className="text-sm text-muted-foreground">
                    Logos, colours, typography and doodle library. ~5.5MB ZIP.
                  </p>
                </div>
              </div>
              <Button asChild>
                <a href={BRAND_KIT_URL} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4" /> Download
                </a>
              </Button>
            </div>
          </Card>
        </section>

        {/* Videos */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Site videos</h2>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={onUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload video"}
              </Button>
            </div>
          </div>
          <Card className="p-0 overflow-hidden">
            {loadingVideos ? (
              <div className="p-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : videos.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No videos uploaded yet. Max 500MB per file.
              </div>
            ) : (
              <ul className="divide-y">
                {videos.map((v) => (
                  <li key={v.name} className="flex items-center gap-3 p-4">
                    <Video className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:underline truncate block"
                      >
                        {v.name}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {(v.size / (1024 * 1024)).toFixed(1)} MB
                        {v.updatedAt ? ` · ${new Date(v.updatedAt).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyUrl(v.url)} title="Copy link">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(v.name)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Admin tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Admin tools</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.to} to={link.to} className="block group">
                  <Card className="p-5 h-full transition-colors hover:border-primary/60">
                    <Icon className="h-5 w-5 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
