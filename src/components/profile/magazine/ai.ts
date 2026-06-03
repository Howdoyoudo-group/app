import { supabase } from "@/integrations/supabase/client";

export async function summarise(text: string, maxChars: number, label: string): Promise<string> {
  const safe = (text || "").trim();
  if (!safe) return "";
  if (safe.length <= maxChars) return safe;
  try {
    const { data } = await supabase.functions.invoke("summarize-profile-block", {
      body: { text: safe, maxChars, label },
    });
    return (data?.summary as string) || safe.slice(0, maxChars) + "…";
  } catch {
    return safe.slice(0, maxChars) + "…";
  }
}

/** Extractive pull quote - pick the strongest sentence from the user's own intro.
 *  Local extraction (zero hallucination): take the longest sentence between 8 and 22 words.
 */
export function extractPullQuote(intro: string | undefined): string {
  const text = (intro || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const candidates = sentences
    .map(s => ({ s, words: s.split(/\s+/).length }))
    .filter(c => c.words >= 6 && c.words <= 24)
    .sort((a, b) => b.words - a.words);
  if (candidates.length === 0) return "";
  let q = candidates[0].s.replace(/[\"“”]/g, "");
  // strip trailing punctuation duplication
  q = q.replace(/[.!?]+$/, "");
  return q;
}
