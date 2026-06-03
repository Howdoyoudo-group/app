import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Bump this version whenever the Terms & Privacy Policy materially changes
// to re-prompt all existing users.
const TERMS_VERSION = "v1";
const STORAGE_KEY = `hdyd_terms_accepted_${TERMS_VERSION}`;

const TermsAcceptBanner = () => {
  const [visible, setVisible] = useState(false);

  // Persist acceptance with a timestamp.
  const persistAcceptance = (reason: "explicit" | "implicit") => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          acceptedAt: new Date().toISOString(),
          version: TERMS_VERSION,
          method: reason,
        })
      );
    } catch {
      // ignore (private mode etc.)
    }
  };

  useEffect(() => {
    let alreadyAccepted = false;
    try {
      alreadyAccepted = !!localStorage.getItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (alreadyAccepted) return;

    setVisible(true);

    // Implicit acceptance: scrolling past 50% of the page OR clicking any
    // internal link counts as continued use under English contract law.
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total >= 0.5) {
        persistAcceptance("implicit");
        setVisible(false);
        cleanup();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      // Ignore clicks on the banner itself (the Terms link / Accept button).
      if (anchor.closest("[data-terms-banner]")) return;
      // Internal navigation only - same origin or relative.
      const href = anchor.getAttribute("href") || "";
      const isInternal =
        href.startsWith("/") ||
        href.startsWith("#") ||
        anchor.hostname === window.location.hostname;
      if (!isInternal) return;
      persistAcceptance("implicit");
      setVisible(false);
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick, true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick, true);

    return cleanup;
  }, []);

  const acceptExplicit = () => {
    persistAcceptance("explicit");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      data-terms-banner
      role="dialog"
      aria-live="polite"
      aria-label="Terms acceptance"
      className="fixed bottom-0 left-0 right-0 z-[60] border-t-2 border-foreground bg-background shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="font-body text-xs sm:text-sm text-foreground flex-1">
          By using this site - browsing, scrolling, or watching content - you
          agree to our{" "}
          <Link to="/terms" className="underline font-600">
            Terms &amp; Privacy Policy
          </Link>
          , including our disclaimer on third-party content.
        </p>
        <button
          onClick={acceptExplicit}
          className="bg-primary text-primary-foreground px-5 py-2 font-display font-700 text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors shrink-0"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default TermsAcceptBanner;
