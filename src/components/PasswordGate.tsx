import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const SITE_PASSWORD = "howdy2026";
const STORAGE_KEY = "site-unlocked";

// URL params that bypass the gate (from email links)
const BYPASS_PARAMS = ["token", "type", "access_token", "refresh_token", "code", "ref"];

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate = ({ children }: PasswordGateProps) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Authenticated users always bypass the gate
  useEffect(() => {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    }
  }, [user]);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
      return;
    }

    // Bypass if arriving from an email link (has auth params or specific paths)
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const path = window.location.pathname;

    const hasEmailParam = BYPASS_PARAMS.some(
      (p) => params.has(p) || hash.includes(p)
    );
    const isAuthPath = ["/auth", "/reset-password", "/unsubscribe"].includes(path);

    if (hasEmailParam || isAuthPath) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5 text-center">
        <h1 className="font-display text-2xl font-700 tracking-tight text-foreground">
          howdy<span className="text-primary">.</span>
        </h1>
        <p className="font-display text-xs font-700 uppercase tracking-widest text-primary mb-1">Beta Trial</p>
        <p className="text-sm text-muted-foreground">This site is in beta - pop in the password to have a look around.</p>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`h-9 text-sm ${error ? "border-destructive" : ""}`}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">That's not it - try again</p>}
          <Button type="submit" size="sm" className="w-full">
            Go
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordGate;
