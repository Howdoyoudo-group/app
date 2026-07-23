import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Maps a normalised employer name -> their uploaded logo_url, sourced from
 * company_profiles (self-serve editable via the employer dashboard). Fetched
 * once and cached at module scope so every CompanyLogo instance on a page
 * (e.g. every job card in the marketplace) shares a single query instead of
 * each doing its own lookup.
 */
let cachedMap: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

async function fetchEmployerLogoMap(): Promise<Record<string, string>> {
  const [{ data: companies }, { data: profiles }] = await Promise.all([
    supabase.from("employer_companies").select("id, name"),
    supabase.from("company_profiles").select("company_id, logo_url").not("logo_url", "is", null),
  ]);
  const idToName = new Map((companies ?? []).map((c: any) => [c.id, c.name as string]));
  const map: Record<string, string> = {};
  (profiles ?? []).forEach((p: any) => {
    const name = idToName.get(p.company_id);
    if (name && p.logo_url) map[name.toLowerCase().trim()] = p.logo_url;
  });
  return map;
}

export function useEmployerLogoMap(): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>(cachedMap ?? {});

  useEffect(() => {
    if (cachedMap) return;
    if (!inflight) {
      inflight = fetchEmployerLogoMap().then((m) => {
        cachedMap = m;
        return m;
      });
    }
    let cancelled = false;
    inflight.then((m) => {
      if (!cancelled) setMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return map;
}
