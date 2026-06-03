import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, KeyRound, Info } from "lucide-react";

interface ProviderRow {
  provider: string;
  status: "ok" | "no_api" | "error" | "no_key";
  metrics?: Record<string, string | number>;
  message?: string;
  docs?: string;
}

function StatusBadge({ status }: { status: ProviderRow["status"] }) {
  if (status === "ok") return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1" />live</Badge>;
  if (status === "no_api") return <Badge variant="secondary"><Info className="h-3 w-3 mr-1" />no usage API</Badge>;
  if (status === "no_key") return <Badge variant="outline"><KeyRound className="h-3 w-3 mr-1" />no key</Badge>;
  return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />error</Badge>;
}

export default function AdminAiCosts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => { document.title = "AI Costs · Admin"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await loadUsage();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadUsage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("provider-usage", { body: {} });
      if (error) throw error;
      setRows(data?.providers ?? []);
      setGeneratedAt(data?.generated_at ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Admins only</h1>
          <p className="text-sm text-muted-foreground">You need an admin role to view AI cost telemetry.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI Costs &amp; Credits</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live pulls from each provider's usage API. {generatedAt && `Updated ${new Date(generatedAt).toLocaleString("en-GB")}`}
            </p>
          </div>
          <Button onClick={loadUsage} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((r) => (
              <Card key={r.provider} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">{r.provider}</h2>
                  <StatusBadge status={r.status} />
                </div>
                {r.metrics && (
                  <dl className="space-y-1.5 text-sm">
                    {Object.entries(r.metrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="font-medium tabular-nums">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {r.message && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {r.message}
                    {r.docs && <> · <a href={r.docs} target="_blank" rel="noreferrer" className="underline">open dashboard</a></>}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
