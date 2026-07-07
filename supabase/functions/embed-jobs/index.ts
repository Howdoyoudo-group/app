// embed-jobs: populate jobs.embedding for semantic matching.
//
// Runs on a 15-minute cron. Each run picks up to `batch_size` live jobs with
// no embedding (newest first) and embeds them via gemini-embedding-001 at
// 768 dims. One mechanism handles both the one-off 49k backfill (~25h wall
// clock) and steady-state embedding of freshly scraped jobs; when there's
// nothing to embed it exits immediately, so the cron is free to run forever.
//
// Deliberately separate from the 7.5k-line fetch-external-jobs scraper.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

declare const EdgeRuntime: { waitUntil?: (p: Promise<unknown>) => void } | undefined;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY =
  Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIMS = 768;
const INPUTS_PER_REQUEST = 100;

export function jobEmbeddingText(job: {
  title: string;
  company: string | null;
  industry: string | null;
  description: string | null;
}): string {
  return [
    job.title,
    job.company ?? "",
    job.industry ?? "",
    (job.description ?? "").slice(0, 1500),
  ]
    .filter(Boolean)
    .join("\n");
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/embeddings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: texts,
        dimensions: EMBED_DIMS,
      }),
    },
  );
  if (!res.ok) throw new Error(`Embeddings API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // API returns embeddings with an index — order defensively.
  const out: number[][] = new Array(texts.length);
  for (const item of data.data) out[item.index] = item.embedding;
  return out;
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const batchSize = Math.min(body.batch_size || 500, 500);

  const work = (async () => {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("id, title, company, industry, description")
      .is("embedding", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(batchSize);

    if (error) {
      console.error("fetch jobs failed:", error.message);
      return;
    }
    if (!jobs?.length) {
      console.log("embed-jobs: nothing to embed");
      return;
    }

    let embedded = 0;
    for (let i = 0; i < jobs.length; i += INPUTS_PER_REQUEST) {
      const chunk = jobs.slice(i, i + INPUTS_PER_REQUEST);
      try {
        const vectors = await embedBatch(chunk.map(jobEmbeddingText));
        // Parallel single-row updates: pgvector columns can't be batch-upserted
        // without clobbering other columns, and 100 tiny updates are fast.
        const results = await Promise.allSettled(
          chunk.map((job, idx) =>
            supabase
              .from("jobs")
              .update({ embedding: JSON.stringify(vectors[idx]) })
              .eq("id", job.id),
          ),
        );
        embedded += results.filter(
          (r) => r.status === "fulfilled" && !(r.value as { error: unknown }).error,
        ).length;
      } catch (e) {
        console.error(`embed chunk failed at offset ${i}:`, e);
        // Rate limit or quota — stop this run, the next cron tick resumes.
        break;
      }
    }
    console.log(`embed-jobs: embedded ${embedded}/${jobs.length}`);
  })();

  if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
    EdgeRuntime.waitUntil(work);
  } else {
    await work;
  }

  return new Response(JSON.stringify({ accepted: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
