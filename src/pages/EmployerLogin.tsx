import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const EmployerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already an employer, jump to dashboard
  useEffect(() => {
    const check = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "employer")
        .maybeSingle();
      if (data) navigate("/employer-dashboard");
    };
    check();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      // Verify employer role
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "employer")
        .maybeSingle();
      if (!roleRow) {
        await supabase.auth.signOut();
        toast.error("This account isn't registered as an employer. Contact us at hello@howdoyoudo.group.");
        return;
      }
      toast.success("Welcome to the Talent Pool.");
      navigate("/employer-dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b-2 border-foreground bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-end">
          <Link to="/employers" className="text-sm font-bold uppercase tracking-wide hover:text-primary">
            Partner packages
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="border-2 border-foreground bg-background">
            <div className="bg-primary px-6 py-3 border-b-2 border-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span className="font-display uppercase tracking-wide">Talent Pool · Employer Login</span>
            </div>
            <div className="p-8">
              <h1 className="font-display text-3xl mb-2">Welcome back</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Partner-only access to your brand's Talent Pool.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-foreground bg-background px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-foreground bg-background px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-foreground text-background border-2 border-foreground px-6 py-3 font-display uppercase tracking-wide hover:bg-primary hover:text-foreground transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Enter dashboard
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-foreground/20 text-xs text-muted-foreground space-y-2">
                <p>
                  Don't have an account?{" "}
                  <Link to="/employers" className="underline font-bold">
                    Apply for a partner package
                  </Link>
                </p>
                <p>
                  Forgot password?{" "}
                  <Link to="/forgot-password" className="underline font-bold">
                    Reset it
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerLogin;
