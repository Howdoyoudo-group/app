/**
 * Tiny TTL cache for raw async fetchers that aren't worth a full React Query
 * migration. Returns cached data instantly while a background refresh runs
 * (stale-while-revalidate).
 *
 * Storage: in-memory (survives navigation within the same tab session) +
 * optional sessionStorage mirror so a tab refresh still shows cached data.
 */

type Entry<T> = { data: T; ts: number };

const mem = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const SS_PREFIX = "ttlcache:";

function readSession<T>(key: string): Entry<T> | null {
  try {
    const raw = sessionStorage.getItem(SS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as Entry<T>;
  } catch {
    return null;
  }
}
function writeSession<T>(key: string, entry: Entry<T>) {
  try {
    sessionStorage.setItem(SS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota or JSON-unfriendly payload — ignore
  }
}

export function getCached<T>(key: string, ttlMs: number): T | null {
  const now = Date.now();
  const hit = (mem.get(key) as Entry<T> | undefined) ?? readSession<T>(key);
  if (!hit) return null;
  if (now - hit.ts > ttlMs) return null;
  // hydrate in-memory from session if needed
  if (!mem.has(key)) mem.set(key, hit as Entry<unknown>);
  return hit.data;
}

export function setCached<T>(key: string, data: T) {
  const entry: Entry<T> = { data, ts: Date.now() };
  mem.set(key, entry as Entry<unknown>);
  writeSession(key, entry);
}

export function invalidate(prefix: string) {
  for (const k of Array.from(mem.keys())) {
    if (k.startsWith(prefix)) mem.delete(k);
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(SS_PREFIX + prefix)) sessionStorage.removeItem(k);
    }
  } catch {}
}

/**
 * Dedupe concurrent fetchers and cache their result.
 * Always runs the fetcher when the cache is stale; callers can use
 * getCached() first to render instantly.
 */
export async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;
  const p = (async () => {
    try {
      const data = await fetcher();
      setCached(key, data);
      return data;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}
