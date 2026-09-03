import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import JobApplicationHelper, { type JobForHelper } from "@/components/JobApplicationHelper";
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable, useDraggable,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Loader2, MapPin, Banknote, Pencil, Trash2, Building2, Sparkles,
  Calendar, BookOpen, Users, Compass, Search, ExternalLink, Kanban, X, AlertCircle,
  CheckCircle2, Circle, UserPlus, Briefcase, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  useJobTracker, TRACKER_STATUSES, CONTACT_STATUSES,
  type TrackerItem, type TrackerStatus, type NewTrackerItem, type OpportunityType,
  type TrackerAction, type TrackerContact, type NewTrackerContact, type ContactStatus,
} from "@/hooks/useJobTracker";
import { getCompanyProfilePath } from "@/lib/company-profiles";
import { getCompanyExternalUrl } from "@/lib/company-external-links";
import { getCompanyUrlFromWhoData } from "@/data/all-companies";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import howdyMascot from "@/assets/howdy-mascot.png";

const openHowdy = (prefill: string) => {
  window.dispatchEvent(new CustomEvent("howdy:open", { detail: { prefill } }));
};

/** `/help-me-apply` reads these to prefill, so the chip actually references
 * the tracked job instead of dropping the user on a blank form. */
const helpMeApplyLink = (item: TrackerItem) => {
  const params = new URLSearchParams();
  params.set("company", item.company);
  if (item.title) params.set("title", item.title);
  if (item.url) params.set("url", item.url);
  return `/help-me-apply?${params.toString()}`;
};

/** Company profile if we have a real culture page, otherwise fall back to
 * the same link already shown on that company's card in the industry's Who
 * tab (the largest source of real company links on the site), then the
 * smaller curated "Most Wanted" external-link list, then a pre-filled
 * search - a card should never be left with no way to look the company up. */
const companyInfoLink = (item: TrackerItem): { label: string; to: string } => {
  const profilePath = getCompanyProfilePath(item.company);
  if (profilePath) return { label: "Company profile", to: profilePath };
  const whoUrl = getCompanyUrlFromWhoData(item.company);
  if (whoUrl) return { label: "Company website", to: whoUrl };
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
 * don't have enough job detail to tailor against). Company-type
 * opportunities (no specific role yet) skip apply-flavoured actions. */
const suggestedActions = (item: TrackerItem, onHelpMeApply: (item: TrackerItem) => void) => {
  const actions: { label: string; icon: typeof Building2; to?: string; onClick?: () => void }[] = [];
  const companyInfo = companyInfoLink(item);
  const isJob = item.opportunity_type !== "company" && !!item.title;

  if (item.status === "wishlist") {
    actions.push({ label: companyInfo.label, icon: Building2, to: companyInfo.to });
    if (isJob) actions.push({ label: "Howdy can help", icon: Sparkles, onClick: () => onHelpMeApply(item) });
    if (item.industry) actions.push({ label: "Explore industry", icon: Compass, to: `/${item.industry}` });
  } else if (item.status === "applied") {
    actions.push({ label: companyInfo.label, icon: Building2, to: companyInfo.to });
    if (isJob) actions.push({ label: "Howdy can help", icon: Sparkles, onClick: () => onHelpMeApply(item) });
    actions.push({ label: "Find a mentor", icon: Users, to: "/mentoring" });
    actions.push({
      label: "Ask Howdy",
      icon: Sparkles,
      onClick: () => openHowdy(`Help me follow up ${isJob ? "on my application to" : "after reaching out to"} ${item.company}${item.title ? ` for ${item.title}` : ""}.`),
    });
  } else if (item.status === "interviewing") {
    actions.push({ label: companyInfo.label, icon: Building2, to: companyInfo.to });
    actions.push({ label: "Find a mentor", icon: Users, to: "/mentoring" });
    actions.push({
      label: "Ask Howdy",
      icon: Sparkles,
      onClick: () => openHowdy(`Help me prepare for my ${isJob ? "interview" : "conversation"} at ${item.company}${item.title ? ` for ${item.title}` : ""}.`),
    });
  } else if (item.status === "offer") {
    actions.push({
      label: "Ask Howdy",
      icon: Sparkles,
      onClick: () => openHowdy(`Help me think through this offer from ${item.company}${item.title ? ` for ${item.title}` : ""}.`),
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
  contactCount,
  collapsed,
  onToggleCollapse,
  onEdit,
  onRemove,
  onStatusChange,
  onHelpMeApply,
  dragHandleProps,
  isDragging,
}: {
  item: TrackerItem;
  contactCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
      <div {...dragHandleProps} className="flex items-start gap-2 min-w-0 cursor-grab active:cursor-grabbing flex-1">
        <CompanyLogo company={item.company} size={32} className="shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h4 className="font-display font-700 text-sm text-foreground truncate">
            {item.title || (item.opportunity_type === "company" ? `Interested in ${item.company}` : item.company)}
          </h4>
          <p className="font-body text-xs text-muted-foreground truncate flex items-center gap-1">
            {item.opportunity_type === "company" && <Building2 className="w-3 h-3 shrink-0" />}
            {item.title ? item.company : "Speculative interest"}
            {collapsed && (
              <span className="ml-1 text-foreground/60">
                · {TRACKER_STATUSES.find((s) => s.value === item.status)?.label}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
          className="p-1 text-muted-foreground hover:text-primary transition-colors"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
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

    {!collapsed && (
      <>
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
            {contactCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> {contactCount} contact{contactCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
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
      </>
    )}
  </div>
);

/** Column drop target (desktop board only). A plain HTML `id` on a `div` is
 * not a dnd-kit droppable - without an explicit `useDroppable` registration
 * here, dropping on an empty column (or the empty space below the last card)
 * never resolves to an `over`, so the drag silently does nothing. */
const Column = ({ status, children }: { status: TrackerStatus; children: ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 min-h-[80px] rounded-2xl transition-colors ${isOver ? "bg-primary/10" : ""}`}
    >
      {children}
    </div>
  );
};

/** Draggable wrapper (desktop board only). */
const SortableCard = ({
  item,
  contactCount,
  collapsed,
  onToggleCollapse,
  onEdit,
  onRemove,
  onStatusChange,
  onHelpMeApply,
}: {
  item: TrackerItem;
  contactCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
        contactCount={contactCount}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
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

const ContactCard = ({
  contact,
  linkedItem,
  onEdit,
  onRemove,
  onStatusChange,
  onJumpToItem,
  dragHandleProps,
  isDragging,
}: {
  contact: TrackerContact;
  linkedItem: TrackerItem | null;
  onEdit: () => void;
  onRemove: () => void;
  onStatusChange: (status: ContactStatus) => void;
  onJumpToItem: () => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}) => (
  <div
    className={`border-2 border-foreground bg-card rounded-2xl p-3.5 shadow-[3px_3px_0_0_hsl(var(--foreground))] transition-opacity ${
      isDragging ? "opacity-40" : ""
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div {...dragHandleProps} className="min-w-0 flex-1 cursor-grab active:cursor-grabbing">
        <h4 className="font-display font-700 text-sm text-foreground truncate">{contact.name}</h4>
        {(contact.role || contact.company) && (
          <p className="font-body text-xs text-muted-foreground truncate">
            {[contact.role, contact.company].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-muted-foreground hover:text-primary transition-colors" aria-label="Edit contact">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove contact">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Explicit status control - always available, doesn't rely on drag-and-drop
        being discovered (desktop board still supports dragging too). */}
    <div className="mt-2.5" onPointerDown={(e) => e.stopPropagation()}>
      <Select value={contact.status} onValueChange={(v) => onStatusChange(v as ContactStatus)}>
        <SelectTrigger className="h-7 text-[11px] rounded-full border-foreground/30 px-2.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {CONTACT_STATUSES.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {contact.relationship && (
      <p className="mt-2 text-[11px] font-body text-foreground/70">{contact.relationship}</p>
    )}
    {contact.contact_info && (
      <p className="mt-1 text-[11px] font-body text-primary">{contact.contact_info}</p>
    )}
    {contact.notes && (
      <p className="mt-1.5 text-[11px] font-body text-muted-foreground border-l-2 border-primary/40 pl-2">{contact.notes}</p>
    )}
    {linkedItem && (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onJumpToItem(); }}
        className="mt-3 inline-flex items-center gap-1 text-[10px] font-body text-muted-foreground hover:text-primary transition-colors"
      >
        <Briefcase className="w-3 h-3" /> {linkedItem.title || linkedItem.company}
      </button>
    )}
  </div>
);

/** Column drop target for the Contacts funnel (desktop board only). */
const ContactColumn = ({ status, children }: { status: ContactStatus; children: ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 min-h-[80px] rounded-2xl transition-colors ${isOver ? "bg-primary/10" : ""}`}
    >
      {children}
    </div>
  );
};

/** Draggable wrapper (desktop board only). No persisted ordering for
 * contacts (no sort_order column), so this uses plain useDraggable rather
 * than the sortable variant used for job cards - dragging only ever changes
 * which funnel stage a contact sits in. */
const DraggableContactCard = ({
  contact,
  linkedItem,
  onEdit,
  onRemove,
  onStatusChange,
  onJumpToItem,
}: {
  contact: TrackerContact;
  linkedItem: TrackerItem | null;
  onEdit: () => void;
  onRemove: () => void;
  onStatusChange: (status: ContactStatus) => void;
  onJumpToItem: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: contact.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style}>
      <ContactCard
        contact={contact}
        linkedItem={linkedItem}
        onEdit={onEdit}
        onRemove={onRemove}
        onStatusChange={onStatusChange}
        onJumpToItem={onJumpToItem}
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
  opportunity_type: "job" as OpportunityType,
  url: "",
  location: "",
  salary: "",
  industry: "",
  status: "wishlist" as TrackerStatus,
  notes: "",
};

const emptyContactDraft = {
  id: null as string | null,
  tracker_item_id: null as string | null,
  company: "",
  name: "",
  role: "",
  relationship: "",
  contact_info: "",
  notes: "",
  status: "not_contacted" as ContactStatus,
};

export default function JobTracker() {
  const { user, loading: authLoading } = useAuth();
  const {
    items, loading, addItem, updateStatus, updateItem, removeItem,
    actions, addAction, toggleActionComplete, removeAction, actionsForItem,
    contacts, addContact, updateContact, removeContact, contactsForItem, contactsForCompany,
  } = useJobTracker();
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
  const [activeTab, setActiveTab] = useState("board");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [newActionText, setNewActionText] = useState("");
  const [newActionDate, setNewActionDate] = useState("");

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactDraft, setContactDraft] = useState(emptyContactDraft);
  const [savingContact, setSavingContact] = useState(false);

  // Card collapse - lets a busy column show more opportunities at once
  // without scrolling as far. Remembered per-visit via localStorage, same
  // pattern as the intro banner's dismissed state.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("job-tracker-collapsed-ids");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  const persistCollapsed = (next: Set<string>) => {
    setCollapsedIds(next);
    try { localStorage.setItem("job-tracker-collapsed-ids", JSON.stringify([...next])); } catch {}
  };
  const toggleCollapse = (id: string) => {
    const next = new Set(collapsedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    persistCollapsed(next);
  };
  const allCollapsed = items.length > 0 && items.every((i) => collapsedIds.has(i.id));
  const toggleCollapseAll = () => {
    persistCollapsed(allCollapsed ? new Set() : new Set(items.map((i) => i.id)));
  };

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

  const contactCountByItem = useMemo(() => {
    const map = new Map<string, number>();
    contacts.forEach((c) => {
      if (c.tracker_item_id) map.set(c.tracker_item_id, (map.get(c.tracker_item_id) ?? 0) + 1);
    });
    return map;
  }, [contacts]);

  // "Needs attention" - the actual point of a tracker: surface what's due
  // (any of an opportunity's scheduled actions) and what's gone quiet (an
  // active opportunity with nothing scheduled at all, sitting untouched for
  // a while), so nothing slips through unnoticed. Resolved opportunities
  // (offer/rejected/withdrawn) are excluded - there's nothing left to act on.
  const ACTIVE_STATUSES: TrackerStatus[] = ["wishlist", "applied", "interviewing"];
  const STALE_AFTER_DAYS = 14;
  const dueActions = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const activeIds = new Set(items.filter((i) => ACTIVE_STATUSES.includes(i.status)).map((i) => i.id));
    return actions
      .filter((a) => !a.completed && !!a.due_date && activeIds.has(a.tracker_item_id))
      .map((a) => ({
        action: a,
        item: items.find((i) => i.id === a.tracker_item_id),
        daysUntil: Math.round((new Date(a.due_date as string).getTime() - now) / dayMs),
      }))
      .filter((x): x is typeof x & { item: TrackerItem } => !!x.item && x.daysUntil <= 2)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .map((x) => ({
        item: x.item,
        label: x.action.description,
        reason:
          x.daysUntil < 0
            ? `Overdue by ${Math.abs(x.daysUntil)}d`
            : x.daysUntil === 0
              ? "Due today"
              : `Due in ${x.daysUntil}d`,
      }));
  }, [items, actions]);

  const staleItems = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const itemsWithDueAction = new Set(
      actions.filter((a) => !a.completed && a.due_date).map((a) => a.tracker_item_id)
    );
    return items
      .filter((i) => ACTIVE_STATUSES.includes(i.status) && !itemsWithDueAction.has(i.id))
      .map((i) => ({
        item: i,
        label: null as string | null,
        daysSince: Math.floor((now - new Date(i.updated_at || i.created_at).getTime()) / dayMs),
      }))
      .filter((x) => x.daysSince >= STALE_AFTER_DAYS)
      .sort((a, b) => b.daysSince - a.daysSince)
      .map((x) => ({ item: x.item, label: x.label, reason: `No activity in ${x.daysSince}d` }));
  }, [items, actions]);

  const attentionRows = [...dueActions, ...staleItems];

  const findContainer = (id: string): TrackerStatus | undefined => {
    if (TRACKER_STATUSES.some((s) => s.value === id)) return id as TrackerStatus;
    return items.find((i) => i.id === id)?.status;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  // Status change (and reorder within a column) is resolved once, on drop -
  // not mid-drag - so the app's own state and dnd-kit's drag session never
  // fight each other. `over.id` is either a column's status (dropped on the
  // column itself, including empty space) or another card's id.
  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeContainer = findContainer(String(active.id));
    const destContainer = findContainer(String(over.id));
    if (!activeContainer || !destContainer) return;
    const destItems = (byStatus.get(destContainer) ?? []).filter((i) => i.id !== active.id);
    const overIndex = destItems.findIndex((i) => i.id === over.id);
    const newIndex = overIndex >= 0 ? overIndex : destItems.length;
    if (destContainer === activeContainer) {
      const currentIndex = (byStatus.get(activeContainer) ?? []).findIndex((i) => i.id === active.id);
      if (currentIndex === newIndex) return;
    }
    await updateStatus(String(active.id), destContainer, newIndex);
  };

  // Contacts funnel - same drag-to-advance idea as the job board, but no
  // persisted ordering (job_tracker_contacts has no sort_order), so a drop
  // only ever changes which stage a contact sits in.
  const contactsByStatus = useMemo(() => {
    const map = new Map<ContactStatus, TrackerContact[]>();
    CONTACT_STATUSES.forEach((s) => map.set(s.value, []));
    contacts.forEach((c) => {
      if (!map.has(c.status)) map.set(c.status, []);
      map.get(c.status)!.push(c);
    });
    return map;
  }, [contacts]);

  const findContactContainer = (id: string): ContactStatus | undefined => {
    if (CONTACT_STATUSES.some((s) => s.value === id)) return id as ContactStatus;
    return contacts.find((c) => c.id === id)?.status;
  };

  const handleContactDragStart = (e: DragStartEvent) => setActiveContactId(String(e.active.id));

  const handleContactDragEnd = async (e: DragEndEvent) => {
    setActiveContactId(null);
    const { active, over } = e;
    if (!over) return;
    const destStatus = findContactContainer(String(over.id));
    if (!destStatus) return;
    const contact = contacts.find((c) => c.id === active.id);
    if (!contact || contact.status === destStatus) return;
    await updateContact(String(active.id), { status: destStatus });
  };

  const openNew = () => {
    setDraft(emptyDraft);
    setNewActionText("");
    setNewActionDate("");
    setDialogOpen(true);
  };

  const openEdit = (item: TrackerItem) => {
    setDraft({
      id: item.id,
      company: item.company,
      title: item.title ?? "",
      opportunity_type: item.opportunity_type,
      url: item.url ?? "",
      location: item.location ?? "",
      salary: item.salary ?? "",
      industry: item.industry ?? "",
      status: item.status,
      notes: item.notes ?? "",
    });
    setNewActionText("");
    setNewActionDate("");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!draft.company.trim()) {
      toast({ title: "Company is required", variant: "destructive" });
      return;
    }
    if (draft.opportunity_type === "job" && !draft.title.trim()) {
      toast({ title: "Role title is required for a job opportunity", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (draft.id) {
      await updateItem(draft.id, {
        title: draft.title.trim() || null,
        notes: draft.notes.trim() || null,
        location: draft.location.trim() || null,
        salary: draft.salary.trim() || null,
      });
    } else {
      const payload: NewTrackerItem = {
        company: draft.company.trim(),
        title: draft.opportunity_type === "company" ? null : draft.title.trim(),
        opportunity_type: draft.opportunity_type,
        url: draft.url.trim() || null,
        location: draft.location.trim() || null,
        salary: draft.salary.trim() || null,
        industry: draft.industry || null,
        status: draft.status,
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

  const addActionToDraft = async () => {
    if (!draft.id || !newActionText.trim()) return;
    await addAction(draft.id, newActionText, newActionDate || null);
    setNewActionText("");
    setNewActionDate("");
  };

  const openNewContact = (prefill?: { tracker_item_id?: string; company?: string }) => {
    setContactDraft({ ...emptyContactDraft, tracker_item_id: prefill?.tracker_item_id ?? null, company: prefill?.company ?? "" });
    setContactDialogOpen(true);
  };

  const openEditContact = (c: TrackerContact) => {
    setContactDraft({
      id: c.id,
      tracker_item_id: c.tracker_item_id,
      company: c.company ?? "",
      name: c.name,
      role: c.role ?? "",
      relationship: c.relationship ?? "",
      contact_info: c.contact_info ?? "",
      notes: c.notes ?? "",
      status: c.status,
    });
    setContactDialogOpen(true);
  };

  const saveContact = async () => {
    if (!contactDraft.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSavingContact(true);
    if (contactDraft.id) {
      await updateContact(contactDraft.id, {
        name: contactDraft.name.trim(),
        company: contactDraft.company.trim() || null,
        role: contactDraft.role.trim() || null,
        relationship: contactDraft.relationship.trim() || null,
        contact_info: contactDraft.contact_info.trim() || null,
        notes: contactDraft.notes.trim() || null,
        status: contactDraft.status,
      });
    } else {
      const payload: NewTrackerContact = {
        tracker_item_id: contactDraft.tracker_item_id,
        company: contactDraft.company.trim() || null,
        name: contactDraft.name.trim(),
        role: contactDraft.role.trim() || null,
        relationship: contactDraft.relationship.trim() || null,
        contact_info: contactDraft.contact_info.trim() || null,
        notes: contactDraft.notes.trim() || null,
        status: contactDraft.status,
      };
      await addContact(payload);
    }
    setSavingContact(false);
    setContactDialogOpen(false);
  };

  const removeContactConfirm = async (id: string) => {
    if (!confirm("Remove this contact?")) return;
    await removeContact(id);
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
  const activeContact = activeContactId ? contacts.find((c) => c.id === activeContactId) : null;
  const draftActions = draft.id ? actionsForItem(draft.id) : [];
  const draftContacts = draft.id
    ? [...contactsForItem(draft.id), ...contactsForCompany(draft.company)].filter(
        (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
      )
    : [];

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
              Every opportunity, one board. Jobs, companies to approach, and the people who can help.
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
                  label: "Track a job or a company",
                  desc: "Tap the board icon on any listing, or add a job manually - or add a company you'd like to approach speculatively, no posting needed.",
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
                  label: "Schedule your actions",
                  desc: "Add as many time-based to-dos as an opportunity needs - each one surfaces under Needs Your Attention when it's due.",
                },
                {
                  step: "4",
                  icon: Users,
                  label: "Track your contacts",
                  desc: "Log key contacts at a company, or people to ask for advice who don't work anywhere on your board yet - see the Contacts tab.",
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

        {attentionRows.length > 0 && (
          <div className="border-2 border-foreground rounded-2xl p-4 sm:p-5 mb-6">
            <h2 className="font-display font-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> Needs your attention
            </h2>
            <div className="space-y-2">
              {attentionRows.map(({ item, label, reason }, i) => (
                <button
                  key={`${item.id}-${i}`}
                  type="button"
                  onClick={() => openEdit(item)}
                  className="w-full flex items-center gap-3 border border-foreground/20 rounded-xl px-3 py-2 hover:border-foreground transition-colors text-left"
                >
                  <CompanyLogo company={item.company} size={28} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-700 text-xs text-foreground truncate">
                      {label || item.title || item.company}
                      <span className="text-muted-foreground font-body font-400"> · {item.company}</span>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <TabsList className="border-2 border-foreground bg-background rounded-2xl h-auto p-1">
              <TabsTrigger value="board" className="rounded-xl font-display font-700 text-xs uppercase tracking-wide data-[state=active]:bg-foreground data-[state=active]:text-background">
                Board
              </TabsTrigger>
              <TabsTrigger value="contacts" className="rounded-xl font-display font-700 text-xs uppercase tracking-wide data-[state=active]:bg-foreground data-[state=active]:text-background">
                Contacts {contacts.length > 0 ? `(${contacts.length})` : ""}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="board" className="mt-0 focus-visible:outline-none">
            <div className="flex justify-end gap-2 mb-5">
              {items.length > 0 && (
                <Button
                  variant="outline"
                  onClick={toggleCollapseAll}
                  className="rounded-2xl font-display font-700 text-xs uppercase tracking-wider"
                >
                  {allCollapsed ? <ChevronDown className="w-4 h-4 mr-1.5" /> : <ChevronUp className="w-4 h-4 mr-1.5" />}
                  {allCollapsed ? "Expand all" : "Collapse all"}
                </Button>
              )}
              <Button onClick={openNew} className="rounded-2xl font-display font-700 text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1.5" /> Add opportunity
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
                  Add a job or a company you'd like to approach, or hit the board icon on a listing in the{" "}
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
                            <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                              <Column status={s.value}>
                                {list.map((item) => (
                                  <SortableCard
                                    key={item.id}
                                    item={item}
                                    contactCount={contactCountByItem.get(item.id) ?? 0}
                                    collapsed={collapsedIds.has(item.id)}
                                    onToggleCollapse={() => toggleCollapse(item.id)}
                                    onEdit={() => openEdit(item)}
                                    onRemove={() => remove(item.id)}
                                    onStatusChange={(status) => updateStatus(item.id, status, 0)}
                                    onHelpMeApply={openHelper}
                                  />
                                ))}
                              </Column>
                            </SortableContext>
                          </div>
                        );
                      })}
                    </div>
                    <DragOverlay>
                      {activeItem ? (
                        <TrackerCard
                          item={activeItem}
                          contactCount={contactCountByItem.get(activeItem.id) ?? 0}
                          collapsed={collapsedIds.has(activeItem.id)}
                          onToggleCollapse={() => {}}
                          onEdit={() => {}}
                          onRemove={() => {}}
                          onStatusChange={() => {}}
                          onHelpMeApply={() => {}}
                        />
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
                              contactCount={contactCountByItem.get(item.id) ?? 0}
                              collapsed={collapsedIds.has(item.id)}
                              onToggleCollapse={() => toggleCollapse(item.id)}
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
          </TabsContent>

          <TabsContent value="contacts" className="mt-0 focus-visible:outline-none">
            <div className="flex justify-end mb-5">
              <Button onClick={() => openNewContact()} className="rounded-2xl font-display font-700 text-xs uppercase tracking-wider">
                <UserPlus className="w-4 h-4 mr-1.5" /> Add contact
              </Button>
            </div>
            {contacts.length === 0 ? (
              <div className="border-2 border-foreground p-10 text-center rounded-2xl">
                <h3 className="font-display font-900 text-base uppercase tracking-wider text-foreground mb-2">
                  No contacts yet
                </h3>
                <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
                  Log people worth approaching for advice - a key contact at a company you're tracking, or
                  someone in the industry generally, even if they don't work anywhere on your board.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop: kanban funnel, same drag-to-advance interaction as the job board */}
                <div className="hidden md:block">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleContactDragStart}
                    onDragEnd={handleContactDragEnd}
                  >
                    <div className="grid grid-cols-4 gap-4">
                      {CONTACT_STATUSES.map((s) => {
                        const list = contactsByStatus.get(s.value) ?? [];
                        return (
                          <div key={s.value} className="min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-display font-700 text-xs uppercase tracking-wider text-foreground">
                                {s.label}
                              </h3>
                              <span className="font-body text-[11px] text-muted-foreground">{list.length}</span>
                            </div>
                            <ContactColumn status={s.value}>
                              {list.map((c) => (
                                <DraggableContactCard
                                  key={c.id}
                                  contact={c}
                                  linkedItem={c.tracker_item_id ? items.find((i) => i.id === c.tracker_item_id) ?? null : null}
                                  onEdit={() => openEditContact(c)}
                                  onRemove={() => removeContactConfirm(c.id)}
                                  onStatusChange={(status) => updateContact(c.id, { status })}
                                  onJumpToItem={() => {
                                    const linked = c.tracker_item_id ? items.find((i) => i.id === c.tracker_item_id) : null;
                                    if (linked) { setActiveTab("board"); openEdit(linked); }
                                  }}
                                />
                              ))}
                            </ContactColumn>
                          </div>
                        );
                      })}
                    </div>
                    <DragOverlay>
                      {activeContact ? (
                        <ContactCard
                          contact={activeContact}
                          linkedItem={activeContact.tracker_item_id ? items.find((i) => i.id === activeContact.tracker_item_id) ?? null : null}
                          onEdit={() => {}}
                          onRemove={() => {}}
                          onStatusChange={() => {}}
                          onJumpToItem={() => {}}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>

                {/* Mobile: stacked list, same explicit status control as desktop */}
                <div className="md:hidden space-y-6">
                  {CONTACT_STATUSES.map((s) => {
                    const list = contactsByStatus.get(s.value) ?? [];
                    if (list.length === 0) return null;
                    return (
                      <div key={s.value}>
                        <h3 className="font-display font-700 text-xs uppercase tracking-wider text-foreground mb-3">
                          {s.label} <span className="text-muted-foreground">({list.length})</span>
                        </h3>
                        <div className="space-y-3">
                          {list.map((c) => (
                            <ContactCard
                              key={c.id}
                              contact={c}
                              linkedItem={c.tracker_item_id ? items.find((i) => i.id === c.tracker_item_id) ?? null : null}
                              onEdit={() => openEditContact(c)}
                              onRemove={() => removeContactConfirm(c.id)}
                              onStatusChange={(status) => updateContact(c.id, { status })}
                              onJumpToItem={() => {
                                const linked = c.tracker_item_id ? items.find((i) => i.id === c.tracker_item_id) : null;
                                if (linked) { setActiveTab("board"); openEdit(linked); }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
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

      {/* Add / edit opportunity */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit opportunity" : "Add opportunity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!draft.id && (
              <div className="space-y-1">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={draft.opportunity_type === "job" ? "default" : "outline"}
                    onClick={() => setDraft((d) => ({ ...d, opportunity_type: "job" }))}
                    className="flex-1"
                  >
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" /> Job
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={draft.opportunity_type === "company" ? "default" : "outline"}
                    onClick={() => setDraft((d) => ({ ...d, opportunity_type: "company" }))}
                    className="flex-1"
                  >
                    <Building2 className="w-3.5 h-3.5 mr-1.5" /> Company to approach
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pick "Company to approach" for a speculative interest with no specific role yet.
                </p>
              </div>
            )}
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
            {(draft.opportunity_type === "job" || !!draft.id) && (
              <div className="space-y-1">
                <Label htmlFor="jt-title">Role title {draft.opportunity_type === "company" && "(optional)"}</Label>
                <Input
                  id="jt-title"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="e.g. Marketing Executive"
                  disabled={!!draft.id}
                />
              </div>
            )}
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
                {draft.opportunity_type === "job" && (
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
                )}
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
              {draft.opportunity_type === "job" && (
                <div className="space-y-1">
                  <Label htmlFor="jt-salary">Salary</Label>
                  <Input
                    id="jt-salary"
                    value={draft.salary}
                    onChange={(e) => setDraft((d) => ({ ...d, salary: e.target.value }))}
                    placeholder="£30k–£35k"
                  />
                </div>
              )}
            </div>

            {draft.id && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="jt-notes">Notes</Label>
                  <Textarea
                    id="jt-notes"
                    value={draft.notes}
                    onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Anything worth remembering…"
                    rows={3}
                  />
                </div>

                {/* Multiple time-based actions - each surfaces under Needs Your
                    Attention independently when its own due date is close. */}
                <div className="space-y-2 border rounded-md p-3">
                  <Label>Actions</Label>
                  {draftActions.length > 0 && (
                    <ul className="space-y-1.5">
                      {draftActions.map((a: TrackerAction) => (
                        <li key={a.id} className="flex items-center gap-2 text-sm border rounded-md px-2.5 py-1.5">
                          <button type="button" onClick={() => toggleActionComplete(a.id)} aria-label={a.completed ? "Mark incomplete" : "Mark complete"}>
                            {a.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <span className={`flex-1 ${a.completed ? "line-through text-muted-foreground" : ""}`}>{a.description}</span>
                          {a.due_date && (
                            <span className="text-xs text-muted-foreground shrink-0">{a.due_date}</span>
                          )}
                          <button type="button" onClick={() => removeAction(a.id)} aria-label="Remove action">
                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addActionToDraft(); } }}
                      placeholder="e.g. Message Jane on LinkedIn"
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={newActionDate}
                      onChange={(e) => setNewActionDate(e.target.value)}
                      className="w-36"
                    />
                    <Button type="button" variant="outline" onClick={addActionToDraft}>Add</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A due date shows this action under "Needs your attention" as it approaches.
                  </p>
                </div>

                {/* Key contacts - at this company, or specifically for this
                    opportunity, so it's obvious who to reach out to. */}
                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <Label>Key contacts</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openNewContact({ tracker_item_id: draft.id ?? undefined, company: draft.company })}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  {draftContacts.length > 0 ? (
                    <ul className="space-y-1.5">
                      {draftContacts.map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-2 text-sm border rounded-md px-2.5 py-1.5">
                          <div className="min-w-0">
                            <span className="font-medium">{c.name}</span>
                            {c.role && <span className="text-muted-foreground"> · {c.role}</span>}
                          </div>
                          <button type="button" onClick={() => openEditContact(c)} className="shrink-0 text-xs text-primary hover:underline">
                            Edit
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No contacts logged for this opportunity yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {draft.id ? "Save changes" : "Add opportunity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / edit contact */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{contactDraft.id ? "Edit contact" : "Add contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="ct-name">Name</Label>
              <Input
                id="ct-name"
                value={contactDraft.name}
                onChange={(e) => setContactDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ct-role">Role</Label>
                <Input
                  id="ct-role"
                  value={contactDraft.role}
                  onChange={(e) => setContactDraft((d) => ({ ...d, role: e.target.value }))}
                  placeholder="Senior PM"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ct-company">Company</Label>
                <Input
                  id="ct-company"
                  value={contactDraft.company}
                  onChange={(e) => setContactDraft((d) => ({ ...d, company: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ct-relationship">How you know them / why approach</Label>
              <Input
                id="ct-relationship"
                value={contactDraft.relationship}
                onChange={(e) => setContactDraft((d) => ({ ...d, relationship: e.target.value }))}
                placeholder="e.g. Ex-colleague, alumni network, 2nd-degree LinkedIn"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ct-info">Contact info</Label>
              <Input
                id="ct-info"
                value={contactDraft.contact_info}
                onChange={(e) => setContactDraft((d) => ({ ...d, contact_info: e.target.value }))}
                placeholder="Email, LinkedIn URL, phone…"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ct-status">Status</Label>
              <Select value={contactDraft.status} onValueChange={(v) => setContactDraft((d) => ({ ...d, status: v as ContactStatus }))}>
                <SelectTrigger id="ct-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTACT_STATUSES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ct-notes">Notes</Label>
              <Textarea
                id="ct-notes"
                value={contactDraft.notes}
                onChange={(e) => setContactDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="What to ask them, what they offered to help with…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setContactDialogOpen(false)} disabled={savingContact}>Cancel</Button>
            <Button onClick={saveContact} disabled={savingContact}>
              {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {contactDraft.id ? "Save changes" : "Add contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
