// Shared HMAC signing for click-tracker links. Used by anything that builds
// a click-tracker URL (send-daily-digest today) and by click-tracker itself
// to verify it. Keeping this in one place means the two sides can't drift.
//
// Why this exists: click-tracker has to redirect to ANY real job/news URL
// (thousands of employer/publisher domains), so a destination allowlist
// isn't workable. Signing the target at build time and verifying it on
// redirect closes the open-redirect risk (an attacker can no longer forge a
// click-tracker link to an arbitrary phishing site) without limiting what
// legitimate links can point to.

export async function signClickTrackerUrl(secret: string, raw: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
