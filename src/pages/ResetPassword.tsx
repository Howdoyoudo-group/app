import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<"recovery" | "invite">("recovery");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    // Capture URL state IMMEDIATELY before anything strips it
    const initialHash = window.location.hash;
    const initialSearch = window.location.search;
    const combined = initialHash + initialSearch;
    const searchParams = new URLSearchParams(initialSearch);
    const code = searchParams.get("code");

    // Detect error in URL (expired/invalid link)
    if (combined.includes("error=") || combined.includes("error_code=")) {
      const params = new URLSearchParams(
        initialHash.replace(/^#/, "") || initialSearch.replace(/^\?/, "")
      );
      setErrorMsg(
        params.get("error_description")?.replace(/\+/g, " ") ||
          "This reset link is invalid or has expired."
      );
      setChecking(false);
      return;
    }

    // Detect any recovery marker (PKCE code, hash token, recovery, or invite -
    // an invited user has no password yet, so completing their invite is the
    // same "verify token, then set a password" flow as a recovery link).
    const isRecoveryLink =
      !!code ||
      combined.includes("type=recovery") ||
      combined.includes("type=invite") ||
      combined.includes("access_token=");

    // Listen for PASSWORD_RECOVERY (fires after auto-exchange/hash parse)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
      }
    });

    // PKCE flow: explicitly exchange the code if present
    const initSession = async () => {
      // token_hash flow (custom email hook)
      const tokenHash = searchParams.get("token_hash");
      const tokenType = searchParams.get("type");
      if (tokenHash && (tokenType === "recovery" || tokenType === "invite")) {
        // Must pass the REAL type through - Supabase's verifyOtp checks the
        // token against the specific type it was issued for, so hardcoding
        // "recovery" here would fail verification on a genuine invite token.
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tokenType });
        if (cancelled) return;
        if (!cancelled) setLinkType(tokenType === "invite" ? "invite" : "recovery");
        if (error) {
          setErrorMsg(
            tokenType === "invite"
              ? "This invite link has already been used or has expired. Ask whoever invited you to send a new one."
              : "This reset link has already been used or has expired. Please request a new one."
          );
          setChecking(false);
          return;
        }
        window.history.replaceState({}, "", "/reset-password");
        setReady(true);
        setChecking(false);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          // Token already consumed (often by email prefetch/security scanners).
          // If a session already exists for this browser, we can still let the
          // user set a new password.
          const { data: { session: existing } } = await supabase.auth.getSession();
          if (existing) {
            window.history.replaceState({}, "", "/reset-password");
            setReady(true);
            setChecking(false);
            return;
          }
          setErrorMsg(
            "This reset link has already been opened (often by your email provider's link scanner). Please request a new one and click it directly from your inbox."
          );
          setChecking(false);
          return;
        }
        window.history.replaceState({}, "", "/reset-password");
        setReady(true);
        setChecking(false);
        return;
      }

      // Hash-token (implicit) flow OR returning to page after token already consumed:
      // if a session exists at all on /reset-password, treat as recovery.
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setReady(true);
        setChecking(false);
      } else if (!isRecoveryLink) {
        setChecking(false);
      }
    };
    initSession();

    // Safety timeout
    const timeout = setTimeout(() => {
      if (!cancelled) setChecking(false);
    }, 5000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(linkType === "invite" ? "Account set up!" : "Password updated!");
      navigate(linkType === "invite" ? "/employer-dashboard" : "/");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-2xl font-900 mb-3">Link not valid<span className="text-primary">.</span></h1>
          <p className="text-muted-foreground font-body text-sm mb-6">
            {errorMsg || "This password reset link is invalid or has expired. Please request a new one."}
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary/90"
          >
            Request new link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-900 mb-6">New password<span className="text-primary">.</span></h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            required
            minLength={6}
          />
          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
