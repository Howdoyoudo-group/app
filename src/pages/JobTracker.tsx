import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import JobApplicationHelper, { type JobForHelper } from "@/components/JobApplicationHelper";
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent, type DragOverEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Loader2, MapPin, Banknote, Pencil, Trash2, Building2, Sparkles,
  Calendar, BookOpen, Users, Compass, Search, ExternalLink, Kanban, X, AlertCircle,
} from "lucide-react";
import { useJobTracker, TRACKER_STATUSES, type TrackerItem, type TrackerStatus, type NewTrackerItem } from "@/hooks/useJobTracker";
import { getCompanyProfilePath } from "@/lib/company-profiles";
import { getCompanyExternalUrl } from "@/lib/company-external-links";
import CompanyLogo from "@/components/CompanyLogo";
import { INDUSTRIES } from "@/data/industries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import howdyMascot from "@/assets/howdy-mascot.png";

const openHowdy = (prefill: string) => {
  window.dispatchEvent(new CustomEvent("howdy:open", { detail: { prefill } }));
};

const industryLabel = (slug: string | null) => {
  if (!slug) return null;
  return INDUSTRIES.find((i) => i.slug === slug)?.name ?? slug;
};

/** `/help-me-apply` reads these to prefill, so the chip actually references
 * the tracked job instead of dropping the user on a blank form. */
const helpMeApplyLink = (item: TrackerItem) => {
  const params = new URLSearchParams();
  params.set("company", item.company);
  params.set("title", item.title);
  if (item.url) params.set("url", item.url);
  return `/help-me-apply?${params.toString()}`;
};

/** Company profile if we have a real culture page, otherwise fall back to
 * the company's own careers/website link (same source used for the "Most
 * Wanted" chips elsewhere), and failing that a pre-filled search - a card
 * should never be left with no way to look the company up. */
const companyInfoLink = (item: TrackerItem): { label: string; to: string } => {
  const profilePath = getCompanyProfilePath(item.company);
  if (profilePath) return { label: "Company profile", to: profilePath };
  const external = getCompanyExternalUrl(item.company);
  if (external) return { label: "Company website", to: external };
  return {
    label: "Search company",
    to: `https://www.google.com/search?q=${encodeURIComponent(`${item.company} careers`)}`,
  };
};

/** Contextual next-step links, tailored to where the card sits in the pipeline.
 * `onHelpMeApply` opens the same Howdy-tailored cover-letter helper used on
 * job cards elsewhere on the site (falls back to the plain form when we
 * don't have enough job detail to tailor against). */
const suggestedActions = (item: TrackerItem, onHelpMeApply: (item: TrackerItem) => void) => {
  const actions: { label: string; icon: typeof Building2; to?: string; onClick?: () => void }[] = [];
  const companyInfo = companyInfoLink(item);

  if (item.status === "wishlist") {
    actions.push({ label: companyInfo.label, icon: Building2, to: companyInfo.to });
    actions.push({ label: "Howdy can help", icon: Sparkles, onClick: () => onHelpMeApply(item) });
    if (item.industry) actions.push({ label: "Explore industry", icon: Compass, to: `/${item.industry}` });
  } else if (item.status === "applied") {
    actions.push({ label: companyInfo.label, icon: Building2, to: companyInfo.to });
    actions.push({ label: "Howdy can help", icon: Sparkles, onClick: () => onHelpMeApply(item) });
    actions.push({ label: "Find a mentor", icon: Users, to: "/mentoring" });
    actions.push({
      label: "Ask Howdy",
      icon: Sparkles,
      onClick: () => openHowdy(`Help me follow up on my application to ${item.company} for ${item.title}.`),
    });
  } else if (item.status === "interviewing") {
    actions.push({ label: companyInfo.label, icon: Building2, to: companyInfo.to });
    actions.push({ label: "Find a mentor", icon: Users, to: "/mentoring" });
    actions.push({
      label: "Ask Howdy",
      icon: Sparkles,
      onClick: () => openHowdy(`Help me prepare for my interview at ${item.company} for ${item.title}.`),
    });
  } else if (item.status === "offer") {
    actions.push({
      label: "Ask Howdy",
      icon: Sparkles,
      onClick: () => openHowdy(`Help me think through this offer from ${item.company} for ${item.title}.`),
    });
  } else if (item.status === "rejected") {
    actions.push({ label: "Howdy Jobs", icon: Search, to: "/my-jobs?tab=jobs" });
    if (item.industry) actions.push({ label: "Explore industry", icon: Compass, to: `/${item.industry}` });
  }

  if (item.industry) {
    actions.push({ label: "Events", icon: Calendar, to: `/${item.industry}#attend` });
    actions.push({ label: "Learning hub", icon: BookOpen, to: `/${item.industry}#learn` });
  }
  return actions;
};

const ActionChip = ({ label, icon: Icon, to, onClick }: ReturnType<typeof suggestedActions>[number]) => {
  const className =
    "inline-flex items-center gap-1 px-2 py-1 border border-foreground/30 rounded-full text-[10px] font-body font-500 text-foreground/70 hover:border-foreground hover:text-foreground transition-colors whitespace-nowrap";
  if (to) {
    if (/^https?:\/\//i.test(to)) {
      return (
        <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
          <Icon className="w-3 h-3" /> {label}
        </a>
      );
    }
    return (
      <Link to={to} className={className}>
        <Icon className="w-3 h-3" /> {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
};

const TrackerCard = ({
  item,
  onEdit,
  onRemove,
  onStatusChange,
  onHelpMeApply,
  dragHandleProps,
  isDragging,
}: {
  item: TrackerItem;
  onEdit: () => void;
  onRemove: () => void;
  onStatusChange: (status: TrackerStatus) => void;
  onHelpMeApply: (item: TrackerItem) => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}) => (
  <div
    className={`border-2 border-foreground bg-card rounded-2xl p-3.5 shadow-[3px_3px_0_0_hsl(var(--foreground))] transition-opacity ${
      isDragging ? "opacity-40" : ""
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div {...dragHandleProps} className="flex items-start gap-2 min-w-0 cursor-grab active:cursor-grabbing">
        <CompanyLogo company={item.company} size={32} className="shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h4 className="font-display font-700 text-sm text-foreground truncate">{item.title}</h4>
          <p className="font-body text-xs text-muted-foreground truncate">{item.company}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Explicit status control - always available, doesn't rely on drag-and-drop
        being discovered (desktop board still supports dragging too). */}
    <div className="mt-2.5" onPointerDown={(e) => e.stopPropagation()}>
      <Select value={item.status} onValueChange={(v) => onStatusChange(v as TrackerStatus)}>
        <SelectTrigger className="h-7 text-[11px] rounded-full border-foreground/30 px-2.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {TRACKER_STATUSES.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {(item.location || item.salary) && (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground font-body">
        {item.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {item.location}
          </span>
        )}
        {item.salary && (
          <span className="inline-flex items-center gap-1">
            <Banknote className="w-3 h-3" /> {item.salary}
          </span>
        )}
      </div>
    )}

    {item.next_action && (
      <p className="mt-2 text-[11px] font-body text-foreground/70 border-l-2 border-primary pl-2">
        {item.next_action}
      </p>
    )}

    <div className="flex flex-wrap gap-1.5 mt-3">
      {suggestedActions(item, onHelpMeApply).map((a) => (
        <ActionChip key={a.label} {...a} />
      ))}
    </div>

    {item.url && (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-body text-primary hover:underline"
      >
        View listing <ExternalLink className="w-3 h-3" />
      </a>
    )}
  </div>
);

/** Draggable wrapper (desktop board only). */
const SortableCard = ({
  item,
  onEdit,
  onRemove,
  onStatusChange,
  onHelpMeApply,
}: {
  item: TrackerItem;
  onEdit: () => void;
  onRemove: () => void;
  onStatusChange: (status: TrackerStatus) => void;
  onHelpMeApply: (item: TrackerItem) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      <TrackerCard
        item={item}
        onEdit={onEdit}
        onRemove={onRemove}
        onStatusChange={onStatusChange}
        onHelpMeApply={onHelpMeApply}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};

const emptyDraft = {
  id: null as string | null,
  company: "",
  title: "",
  url: "",
  location: "",
  salary: "",
  industry: "",
  status: "wishlist" as TrackerStatus,
  notes: "",
  next_action: "",
  follow_up_date: "",
};

export default function JobTracker() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading, addItem, updateStatus, updateItem, removeItem } = useJobTracker();
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return localStorage.getItem("job-tracker-intro-dismissed") !== "1";
    } catch {
      return true;
    }
  });
  const dismissIntro = () => {
    setShowIntro(false);
    try { localStorage.setItem("job-tracker-intro-dismissed", "1"); } catch {}
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // "Howdy can help" - the same tailored cover-letter/CV-tips helper used on
  // job cards in the Marketplace. It needs the full job description, which
  // tracker items don't store, so for job-board items we fetch the source
  // row from `jobs` on demand; for manually-added items (or if the source
  // listing has since expired) we fall back to the plain Help Me Apply form.
  const [helperJob, setHelperJob] = useState<JobForHelper | null>(null);
  const [helperLoading, setHelperLoading] = useState(false);
  const openHelper = async (item: TrackerItem) => {
    if (!item.job_id) {
      window.location.assign(helpMeApplyLink(item));
      return;
    }
    setHelperLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select("title, company, industry, location, salary, description, tags, type")
      .eq("id", item.job_id)
      .maybeSingle();
    setHelperLoading(false);
    if (!data || !data.description) {
      window.location.assign(helpMeApplyLink(item));
      return;
    }
    setHelperJob({
      title: data.title,
      company: data.company,
      industry: data.industry || item.industry || "",
      location: data.location || item.location || "",
      salary: data.salary || item.salary || "",
      description: data.description,
      tags: data.tags || [],
      type: data.type || "",
    });
  };

  const byStatus = useMemo(() => {
    const map = new Map<TrackerStatus, TrackerItem[]>();
    TRACKER_STATUSES.forEach((s) => map.set(s.value, []));
    items.forEach((i) => {
      if (!map.has(i.status)) map.set(i.status, []);
      map.get(i.status)!.push(i);
    });
    map.forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order));
    return map;
  }, [items]);

  // "Needs attention" - the actual point of a tracker: surface what's due
  // (a follow-up or closing date) and what's gone quiet (sitting in the
  // same active stage for a while with nothing scheduled), so nothing
  // slips through unnoticed. Resolved cards (offer/rejected/withdrawn)
  // are excluded - there's nothing left to act on there.
  const ACTIVE_STATUSES: TrackerStatus[] = ["wishlist", "applied", "interviewing"];
  const STALE_AFTER_DAYS = 14;
  const attentionItems = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const active = items.filter((i) => ACTIVE_STATUSES.includes(i.status));

    const due = active
      .filter((i) => !!i.follow_up_date)
      .map((i) => ({
        item: i,
        daysUntil: Math.round((new Date(i.follow_up_date as string).getTime() - now) / dayMs),
      }))
      .filter((x) => x.daysUntil <= 2)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .map((x) => ({
        item: x.item,
        reason:
          x.daysUntil < 0
            ? `Overdue by ${Math.abs(x.daysUntil)}d`
            : x.daysUntil === 0
              ? "Due today"
              : `Due in ${x.daysUntil}d`,
      }));

    const dueIds = new Set(due.map((x) => x.item.id));
    const stale = active
      .filter((i) => !i.follow_up_date && !dueIds.has(i.id))
      .map((i) => ({
        item: i,
        daysSince: Math.floor((now - new Date(i.updated_at || i.created_at).getTime()) / dayMs),
      }))
      .filter((x) => x.daysSince >= STALE_AFTER_DAYS)
      .sort((a, b) => b.daysSince - a.daysSince)
      .map((x) => ({ item: x.item, reason: `No activity in ${x.daysSince}d` }));

    return [...due, ...stale];
  }, [items]);

  const findContainer = (id: string): TrackerStatus | undefined => {
    if (TRACKER_STATUSES.some((s) => s.value === id)) return id as TrackerStatus;
    return items.find((i) => i.id === id)?.status;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeContainer = findContainer(String(active.id));
    const overContainer = findContainer(String(over.id));
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;
    // Local-only preview move; the real persist happens in handleDragEnd.
    updateStatus(String(active.id), overContainer);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const destContainer = findContainer(String(over.id));
    if (!destContainer) return;
    const destItems = byStatus.get(destContainer) ?? [];
    const overIndex = destItems.findIndex((i) => i.id === over.id);
    const newIndex = overIndex >= 0 ? overIndex : destItems.length;
    await updateStatus(String(active.id), destContainer, newIndex);
  };

  const openNew = () => {
    setDraft(emptyDraft);
    setDialogOpen(true);
  };

  const openEdit = (item: TrackerItem) => {
    setDraft({
      id: item.id,
      company: item.company,
      title: item.title,
      url: item.url ?? "",
      location: item.location ?? "",
      salary: item.salary ?? "",
      industry: item.industry ?? "",
      status: item.status,
      notes: item.notes ?? "",
      next_action: item.next_action ?? "",
      follow_up_date: item.follow_up_date ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!draft.company.trim() || !draft.title.trim()) {
      toast({ title: "Company and role title are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (draft.id) {
      await updateItem(draft.id, {
        notes: draft.notes.trim() || null,
        next_action: draft.next_action.trim() || null,
        follow_up_date: draft.follow_up_date || null,
        location: draft.location.trim() || null,
        salary: draft.salary.trim() || null,
      });
    } else {
      const payload: NewTrackerItem = {
        company: draft.company.trim(),
        title: draft.title.trim(),
        url: draft.url.trim() || null,
        location: draft.location.trim() || null,
        salary: draft.salary.trim() || null,
        industry: draft.industry || null,
        status: draft.status,
        follow_up_date: draft.follow_up_date || null,
      };
      await addItem(payload);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this from your tracker?")) return;
    await removeItem(id);
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="border-2 border-foreground rounded-2xl p-8 text-center max-w-sm shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <h1 className="font-display font-900 text-xl uppercase tracking-wide mb-2">Job Tracker</h1>
          <p className="font-body text-sm text-muted-foreground mb-5">
            Sign in to track every application from wishlist to offer.
          </p>
          <Link
            to="/auth?redirect=/job-tracker"
            className="inline-flex items-center justify-center border-2 border-foreground bg-primary text-primary-foreground rounded-2xl px-4 py-2 font-display font-700 text-xs uppercase tracking-wider shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/job-tracker" title="Job Tracker" noIndex />
      <div className="max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12">
        <header className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-900 text-[26px] sm:text-[34px] leading-[1.02] tracking-tight text-foreground">
              Job Tracker<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 font-body text-[13px] sm:text-sm text-foreground/55 leading-snug">
              Every application, one board. Wishlist through to offer.
            </p>
          </div>
          <Link
            to="/howdy"
            aria-label="Open Howdy"
            className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-1 bg-primary ring-2 ring-foreground/10 hover:ring-foreground/30 transition overflow-hidden"
          >
            <img src={howdyMascot} alt="" className="w-8 h-8 object-contain" />
          </Link>
        </header>

        {showIntro && (
          <div className="relative border-2 border-foreground rounded-2xl p-4 sm:p-5 mb-6 bg-primary/5">
            <button
              type="button"
              onClick={dismissIntro}
              aria-label="Dismiss"
              className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-display font-900 text-sm uppercase tracking-wide mb-3 pr-6">
              How Job Tracker works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  step: "1",
                  icon: Kanban,
                  label: "Track a job",
                  desc: "Tap the board icon on any listing in the Marketplace or Howdy Jobs, or add one manually here.",
                },
                {
                  step: "2",
                  icon: ExternalLink,
                  label: "Move it forward",
                  desc: "Use the status pill on a card (or drag it on desktop) as you go from Wishlist to Applied, Interviewing, Offer.",
                },
                {
                  step: "3",
                  icon: AlertCircle,
                  label: "Set a follow-up date",
                  desc: "Edit a card to add a closing date or reminder - it'll surface under Needs Your Attention when it's due, or if the card's gone quiet.",
                },
                {
                  step: "4",
                  icon: Sparkles,
                  label: "Follow the suggestions",
                  desc: "Every card links to Howdy's tailored cover letter, Company Profiles, Mentoring, Events and more for that stage.",
                },
              ].map((s) => (
                <div key={s.step} className="border-2 border-foreground/20 rounded-2xl p-3 flex gap-2.5 bg-background">
                  <div className="w-6 h-6 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shrink-0 font-display font-900 text-[11px]">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-display font-700 text-xs uppercase tracking-wide mb-0.5">{s.label}</p>
                    <p className="font-body text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {attentionItems.length > 0 && (
          <div className="border-2 border-foreground rounded-2xl p-4 sm:p-5 mb-6">
            <h2 className="font-display font-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> Needs your attention
            </h2>
            <div className="space-y-2">
              {attentionItems.map(({ item, reason }) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openEdit(item)}
                  className="w-full flex items-center gap-3 border border-foreground/20 rounded-xl px-3 py-2 hover:border-foreground transition-colors text-left"
                >
                  <CompanyLogo company={item.company} size={28} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-700 text-xs text-foreground truncate">
                      {item.title} <span className="text-muted-foreground font-body font-400">· {item.company}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-display font-700 uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-foreground">
                    {reason}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mb-5">
          <Button onClick={openNew} className="rounded-2xl font-display font-700 text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-1.5" /> Add job
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="border-2 border-foreground p-10 text-center rounded-2xl">
            <h3 className="font-display font-900 text-base uppercase tracking-wider text-foreground mb-2">
              Nothing tracked yet
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
              Add a job you've found elsewhere, or hit "Track this job" from a listing in the{" "}
              <Link to="/marketplace" className="text-primary underline">Jobs Marketplace</Link>.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: kanban board */}
            <div className="hidden md:block">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-5 gap-4">
                  {TRACKER_STATUSES.map((s) => {
                    const list = byStatus.get(s.value) ?? [];
                    return (
                      <div key={s.value} className="min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display font-700 text-xs uppercase tracking-wider text-foreground">
                            {s.label}
                          </h3>
                          <span className="font-body text-[11px] text-muted-foreground">{list.length}</span>
                        </div>
                        <SortableContext items={[s.value, ...list.map((i) => i.id)]} strategy={verticalListSortingStrategy}>
                          <div id={s.value} className="space-y-3 min-h-[80px]">
                            {list.map((item) => (
                              <SortableCard
                                key={item.id}
                                item={item}
                                onEdit={() => openEdit(item)}
                                onRemove={() => remove(item.id)}
                                onStatusChange={(status) => updateStatus(item.id, status, 0)}
                                onHelpMeApply={openHelper}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </div>
                    );
                  })}
                </div>
                <DragOverlay>
                  {activeItem ? (
                    <TrackerCard item={activeItem} onEdit={() => {}} onRemove={() => {}} onStatusChange={() => {}} onHelpMeApply={() => {}} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>

            {/* Mobile: stacked list, same explicit status control as desktop */}
            <div className="md:hidden space-y-6">
              {TRACKER_STATUSES.map((s) => {
                const list = byStatus.get(s.value) ?? [];
                if (list.length === 0) return null;
                return (
                  <div key={s.value}>
                    <h3 className="font-display font-700 text-xs uppercase tracking-wider text-foreground mb-3">
                      {s.label} <span className="text-muted-foreground">({list.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {list.map((item) => (
                        <TrackerCard
                          key={item.id}
                          item={item}
                          onEdit={() => openEdit(item)}
                          onRemove={() => remove(item.id)}
                          onStatusChange={(status) => updateStatus(item.id, status, 0)}
                          onHelpMeApply={openHelper}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {helperLoading && (
        <div className="fixed inset-0 z-50 bg-background/70 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      <Dialog open={!!helperJob} onOpenChange={(open) => { if (!open) setHelperJob(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {helperJob && <JobApplicationHelper job={helperJob} onBack={() => setHelperJob(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit job" : "Add job"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="jt-company">Company</Label>
              <Input
                id="jt-company"
                value={draft.company}
                onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
                placeholder="e.g. Greggs"
                disabled={!!draft.id}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jt-title">Role title</Label>
              <Input
                id="jt-title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Marketing Executive"
                disabled={!!draft.id}
              />
            </div>
            {!draft.id && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="jt-industry">Industry</Label>
                  <Select value={draft.industry} onValueChange={(v) => setDraft((d) => ({ ...d, industry: v }))}>
                    <SelectTrigger id="jt-industry"><SelectValue placeholder="Pick an industry (optional)" /></SelectTrigger>
                    <SelectContent className="max-h-72" position="item-aligned">
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i.slug} value={i.slug}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jt-status">Status</Label>
                  <Select value={draft.status} onValueChange={(v) => setDraft((d) => ({ ...d, status: v as TrackerStatus }))}>
                    <SelectTrigger id="jt-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRACKER_STATUSES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jt-url">Listing URL</Label>
                  <Input
                    id="jt-url"
                    type="url"
                    value={draft.url}
                    onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="jt-location">Location</Label>
                <Input
                  id="jt-location"
                  value={draft.location}
                  onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  placeholder="London"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="jt-salary">Salary</Label>
                <Input
                  id="jt-salary"
                  value={draft.salary}
                  onChange={(e) => setDraft((d) => ({ ...d, salary: e.target.value }))}
                  placeholder="£30k–£35k"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="jt-followup">Follow-up / closing date</Label>
              <Input
                id="jt-followup"
                type="date"
                value={draft.follow_up_date}
                onChange={(e) => setDraft((d) => ({ ...d, follow_up_date: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Shows up under "Needs your attention" when it's due or overdue.
              </p>
            </div>
            {draft.id && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="jt-next">Next action</Label>
                  <Input
                    id="jt-next"
                    value={draft.next_action}
                    onChange={(e) => setDraft((d) => ({ ...d, next_action: e.target.value }))}
                    placeholder="e.g. Message Jane on LinkedIn"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jt-notes">Notes</Label>
                  <Textarea
                    id="jt-notes"
                    value={draft.notes}
                    onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Contacts, interview notes, anything worth remembering…"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {draft.id ? "Save changes" : "Add job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
