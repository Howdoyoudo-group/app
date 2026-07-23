import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, HeartHandshake, Star, Target, Check } from "lucide-react";
import RoleLearnSection from "@/components/RoleLearnSection";
import MentoringPanel from "@/components/MentoringPanel";
import RoleNCSPanel from "@/components/RoleNCSPanel";
import SEO, { roleDesc, breadcrumbJsonLd } from "@/components/SEO";
import ReorderListenSections from "@/components/ReorderListenSections";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import tabListen from "@/assets/tab-listen.png";
import tabRead from "@/assets/tab-read.png";
import tabWatch from "@/assets/tab-watch.png";
import tabWho from "@/assets/tab-who.png";
import tabAttend from "@/assets/tab-attend.png";
import tabLearn from "@/assets/tab-learn.png";
import tabApply from "@/assets/tab-apply.png";
import tabPlan from "@/assets/tab-work.png";

const TAB_ICONS: Record<string, string> = {
  listen: tabListen,
  read: tabRead,
  watch: tabWatch,
  work: tabWho,
  attend: tabAttend,
  learn: tabLearn,
  apply: tabApply,
  plan: tabPlan,
};

const TAB_ORDER = ["plan", "read", "listen", "watch", "work", "attend", "learn", "mentor", "apply"];

export interface RoleTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface RolePageLayoutProps {
  name: string;
  description: string;
  tabs: RoleTab[];
  category?: "business" | "craft" | "frontline";
  /**
   * The role's real slug from src/data/roles.ts (e.g. "theatre-stage-manager").
   * Always pass this when the caller has it - it's what role_metadata,
   * role_skills etc. are actually keyed by. Without it, we fall back to
   * guessing a slug from the display name, which silently breaks whenever
   * the name doesn't slugify to the same thing as the real slug (e.g.
   * "Buyer / Merchandiser" -> "buyer-merchandiser" vs the real "buyer").
   */
  slug?: string;
}

const slugifyRoleName = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const RolePageLayout = ({ name, description, tabs, category, slug }: RolePageLayoutProps) => {
  const roleSlug = useMemo(() => slug ?? slugifyRoleName(name), [name, slug]);
  const { user } = useAuth();
  const [activeRoleSlug, setActiveRoleSlug] = useState<string | null>(null);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const isSaved = targetRoles.includes(name);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("active_role_slug, job_preferences")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setActiveRoleSlug((data as any)?.active_role_slug ?? null);
        const jp = (data?.job_preferences as Record<string, unknown>) || {};
        setTargetRoles(Array.isArray(jp.targetRoles) ? (jp.targetRoles as string[]) : []);
      });
  }, [user]);

  // "Save to Most Wanted" does double duty here: it's the wishlist AND -
  // since we always have a real slug on a role page - it becomes Howdy's
  // coaching focus too. Same single action as the industry CareerMap tiles.
  const saveToMostWanted = async () => {
    if (!user || isSaved) return;
    setSaving(true);
    const { data: existing } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user.id)
      .maybeSingle();
    const jp = (existing?.job_preferences as Record<string, unknown>) || {};
    const next = [...targetRoles, name];
    await supabase
      .from("profiles")
      .update({
        job_preferences: { ...jp, targetRoles: next },
        active_role_slug: roleSlug,
        active_role_set_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", user.id);
    setTargetRoles(next);
    setActiveRoleSlug(roleSlug);
    setSaving(false);
  };

  const enhancedTabs = useMemo(() => {
    let result: RoleTab[];
    if (tabs.some((tab) => tab.id === "learn")) {
      result = tabs;
    } else {
      const applyIndex = tabs.findIndex((tab) => tab.id === "apply");
      const learnTab: RoleTab = {
        id: "learn",
        label: "Learn",
        content: <RoleLearnSection roleName={name} roleSlug={roleSlug} />,
      };
      if (applyIndex === -1) {
        result = [...tabs, learnTab];
      } else {
        result = [...tabs.slice(0, applyIndex), learnTab, ...tabs.slice(applyIndex)];
      }
    }
    // Auto-inject NCS data panel at the top of the "plan" tab for every role
    result = result.map((tab) => {
      if (tab.id !== "plan") return tab;
      return {
        ...tab,
        content: (
          <>
            <RoleNCSPanel slug={roleSlug} />
            {tab.content}
          </>
        ),
      };
    });

    // Auto-inject Mentor tab for every role
    if (!result.some((t) => t.id === "mentor")) {
      const mentorTab: RoleTab = {
        id: "mentor",
        label: "Mentor",
        content: <MentoringPanel role={name} />,
      };
      const applyIdx = result.findIndex((t) => t.id === "apply");
      result = applyIdx === -1
        ? [...result, mentorTab]
        : [...result.slice(0, applyIdx), mentorTab, ...result.slice(applyIdx)];
    }
    return [...result].sort((a, b) => {
      const ai = TAB_ORDER.indexOf(a.id);
      const bi = TAB_ORDER.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [name, roleSlug, tabs]);

  const [activeTab, setActiveTab] = useState(enhancedTabs[0]?.id || "");
  const activeTabObj = enhancedTabs.find((t) => t.id === activeTab);
  const rawContent = activeTabObj?.content;
  const activeContent = activeTabObj?.id === "listen"
    ? <ReorderListenSections>{rawContent}</ReorderListenSections>
    : rawContent;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${name} - Role Guide & Jobs`}
        description={roleDesc(name)}
        path={`/roles/${roleSlug}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Roles", path: "/roles" },
          { name, path: `/roles/${roleSlug}` },
        ])}
      />
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        <Link
          to="/roles"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to roles
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-foreground text-xs tracking-[0.3em] uppercase font-body mb-3">
            How do you do<span className="text-primary">?</span>
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-4">
            {name}
            <span className="text-primary">.</span>
          </h1>
          {category && (
            <p className="text-xs tracking-[0.2em] uppercase font-body text-primary/80 mb-3">
              {category === "business"
                ? "This role exists across industries"
                : category === "frontline"
                  ? "Frontline role - the people who deliver every day"
                  : "This role is specific to this industry"}
            </p>
          )}
          <p className="text-muted-foreground font-body text-lg max-w-xl mb-4">
            {description}
          </p>

          <div className="mb-6">
            {!user ? (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-foreground text-xs font-display font-700 uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
              >
                <Target className="w-3.5 h-3.5" /> Sign in to save to Most Wanted
              </Link>
            ) : (
              <button
                onClick={saveToMostWanted}
                disabled={isSaved || saving}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 text-xs font-display font-700 uppercase tracking-wider transition-colors ${
                  isSaved
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                {activeRoleSlug === roleSlug ? (
                  <><Star className="w-3.5 h-3.5 fill-current" /> Your target role - Howdy's coaching you on this</>
                ) : isSaved ? (
                  <><Check className="w-3.5 h-3.5" /> Saved to Most Wanted</>
                ) : (
                  <><Target className="w-3.5 h-3.5" /> Save to Most Wanted</>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 md:grid-cols-9 gap-3 mb-12 border-b border-border pb-6">
            {enhancedTabs.map((tab) => {
              const icon = TAB_ICONS[tab.id];
              const isActive = activeTab === tab.id;
              const isApply = tab.id === "apply";
              const isMentor = tab.id === "mentor";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-2 px-3 py-4 transition-all border-2 ${
                    isApply
                      ? isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary bg-primary/10 hover:bg-primary/20"
                      : isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                  }`}
                >
                  {icon ? (
                    <img
                      src={icon}
                      alt={tab.label}
                      className={`w-10 h-10 md:w-12 md:h-12 object-contain transition-opacity ${
                        isActive ? "opacity-100" : isApply ? "opacity-80" : "opacity-60"
                      }`}
                      loading="lazy"
                      width={48}
                      height={48}
                    />
                  ) : isMentor ? (
                    <HeartHandshake
                      className={`w-10 h-10 md:w-12 md:h-12 transition-opacity ${
                        isActive ? "opacity-100 text-primary" : "opacity-60"
                      }`}
                      strokeWidth={1.5}
                    />
                  ) : null}
                  <span
                    className={`font-display font-700 text-xs tracking-wide uppercase transition-colors ${
                      isApply
                        ? isActive ? "text-primary-foreground" : "text-primary"
                        : isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RolePageLayout;

