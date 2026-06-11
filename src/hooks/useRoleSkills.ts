import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RoleSkill {
  id: string;
  slug: string;
  skill_title: string;
  skill_type: "knowledge" | "skill" | "behaviour" | null;
  broad_domain: string | null;
  skill_area: string | null;
  source: string;
  display_order: number;
}

export interface SkillDomain {
  domain: string;
  count: number;
  areas: {
    area: string;
    skills: RoleSkill[];
  }[];
}

export function useRoleSkills(slug: string) {
  const [skills, setSkills] = useState<RoleSkill[]>([]);
  const [domains, setDomains] = useState<SkillDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);

    supabase
      .from("role_skills")
      .select("id,slug,skill_title,skill_type,broad_domain,skill_area,source,display_order")
      .eq("slug", slug)
      .order("broad_domain", { ascending: true })
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        const rows = (data ?? []) as RoleSkill[];
        setSkills(rows);
        setHasData(rows.length > 0);

        // Group into domain → area → skills
        const domainMap = new Map<string, Map<string, RoleSkill[]>>();
        for (const skill of rows) {
          const d = skill.broad_domain ?? "General";
          const a = skill.skill_area ?? "Core Skills";
          if (!domainMap.has(d)) domainMap.set(d, new Map());
          const areaMap = domainMap.get(d)!;
          if (!areaMap.has(a)) areaMap.set(a, []);
          areaMap.get(a)!.push(skill);
        }

        const grouped: SkillDomain[] = [];
        for (const [domain, areaMap] of domainMap) {
          const areas = [];
          for (const [area, areaSkills] of areaMap) {
            areas.push({ area, skills: areaSkills });
          }
          grouped.push({ domain, count: rows.filter((s) => (s.broad_domain ?? "General") === domain).length, areas });
        }
        grouped.sort((a, b) => b.count - a.count);
        setDomains(grouped);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { skills, domains, loading, hasData };
}
