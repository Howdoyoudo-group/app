import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const nextPath = useMemo(() => {
    const requestedPath = params.get("next") || params.get("redirect") || "/onboarding";
    return requestedPath.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/onboarding";
  }, [params]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(nextPath, { replace: true });
    }
  }, [authLoading, navigate, nextPath, user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!isLogin && !fullName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!isLogin && !acceptedTerms) {
      toast.error("Please accept the Terms & Privacy Policy to continue.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          navigate(data.session ? nextPath : "/");
        }
        return;
      }

      const trimmedEmail = email.trim().toLowerCase();
      const { error, data } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `https://howdoyoudo.group/onboarding`,
        },
      });

      if (error) {
        const message = error.message?.toLowerCase() || "";
        const looksLikeTimeout = message.includes("timeout") || message.includes("upstream") || message.includes("504") || message.includes("gateway");

        if (looksLikeTimeout) {
          toast.success("Your account was likely created - check your email for the confirmation link, then try signing in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.session) {
        toast.success("Welcome! Let's set up your profile.");
        navigate("/onboarding");
      } else {
        toast.success("Check your email to verify your account, then you'll be guided through setup.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const redirectUri = `${window.location.origin}/auth?next=${encodeURIComponent(nextPath)}`;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirectUri,
    });

    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }

    if (result.redirected) return;

    toast.success("Welcome!");
    navigate(nextPath);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* spacer */}

        <h1 className="font-display text-3xl md:text-4xl font-900 leading-none mb-2">
          {isLogin ? "Welcome back" : "Join the community"}<span className="text-primary">.</span>
        </h1>
        <p className="text-muted-foreground font-body text-sm mb-8">
          {isLogin ? "Sign in to view your saved profile and career matches." : "Create an account to save your career profile and get personalised matches."}
        </p>

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-border px-4 py-3 font-display font-600 text-sm hover:bg-muted/50 transition-colors mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-border" />
          <span className="text-muted-foreground font-body text-xs uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              maxLength={100}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            required
            maxLength={255}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            required
            minLength={6}
          />

          {isLogin && (
            <Link to="/forgot-password" className="block text-right text-primary font-body text-xs hover:underline">
              Forgot password?
            </Link>
          )}

          {!isLogin && (
            <label className="flex items-start gap-2 text-xs font-body text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Terms &amp; Privacy Policy
                </Link>
                , including the disclaimer on third-party content.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-600 hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
