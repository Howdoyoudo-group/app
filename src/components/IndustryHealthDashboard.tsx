import { useState, useEffect } from "react";
import { AlertCircle, TrendingUp, Zap, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface IndustryHealth {
  industry: string;
  jobs: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "HEALTHY";
  lastScraped?: string;
  jobsInLastHour?: number;
  sources?: string[];
}

interface AuditData {
  summary: {
    totalIndustries: number;
    healthyIndustries: number;
    problemIndustries: number;
    totalJobs: number;
  };
  problemIndustries: IndustryHealth[];
  healthyIndustries: IndustryHealth[];
  sourceHealth: any[];
  recommendations: string[];
  timestamp: string;
}

export default function IndustryHealthDashboard() {
  const { session } = useAuth();
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revalidating, setRevalidating] = useState(false);

  const fetchAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session?.access_token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("industry-audit", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) {
        throw fnError;
      }

      setAudit(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch audit data";
      console.error("Audit fetch error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const triggerRevalidation = async (threshold = 100) => {
    setRevalidating(true);
    try {
      if (!session?.access_token) {
        setError("Not authenticated");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "revalidate-low-count-industries",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: { threshold },
        }
      );

      if (fnError) {
        throw fnError;
      }

      console.log("Revalidation response:", data);
      setTimeout(fetchAudit, 2000); // Refresh after 2s
    } catch (err) {
      const message = err instanceof Error ? err.message : "Revalidation failed";
      console.error("Revalidation error:", err);
      setError(message);
    } finally {
      setRevalidating(false);
    }
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-slate-600">Loading audit data...</div>;
  }

  if (error || !audit) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-bold mb-2">Error Loading Dashboard</p>
        <p className="text-red-600 text-sm mb-4">{error || "No audit data available"}</p>
        <button
          onClick={() => fetchAudit()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 border-red-300 text-red-900";
      case "HIGH":
        return "bg-orange-100 border-orange-300 text-orange-900";
      case "MEDIUM":
        return "bg-yellow-100 border-yellow-300 text-yellow-900";
      default:
        return "bg-green-100 border-green-300 text-green-900";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-slate-900">Industry Health Dashboard</h2>
          <button
            onClick={() => fetchAudit()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <p className="text-sm text-slate-600">
          Last updated: {new Date(audit.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Total Industries</p>
          <p className="text-3xl font-bold text-slate-900">{audit.summary.totalIndustries}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">Healthy</p>
          <p className="text-3xl font-bold text-green-900">{audit.summary.healthyIndustries}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">Problems</p>
          <p className="text-3xl font-bold text-red-900">{audit.summary.problemIndustries}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Total Jobs</p>
          <p className="text-3xl font-bold text-blue-900">{audit.summary.totalJobs.toLocaleString()}</p>
        </div>
      </div>

      {/* Problem Industries */}
      {audit.problemIndustries.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Problem Industries ({audit.problemIndustries.length})
            </h3>
            <button
              onClick={() => triggerRevalidation(100)}
              disabled={revalidating}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {revalidating ? "Revalidating..." : "Revalidate All"}
            </button>
          </div>
          <div className="space-y-3">
            {audit.problemIndustries.map((ind) => (
              <div
                key={ind.industry}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(ind.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-lg capitalize">{ind.industry}</p>
                    <p className="text-sm opacity-75">
                      {ind.jobs} jobs | Last: {ind.lastScraped ? new Date(ind.lastScraped).toLocaleDateString() : "unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{ind.jobs}</p>
                    <p className="text-xs">({ind.jobsInLastHour || 0}/hr)</p>
                  </div>
                </div>
                {ind.sources && ind.sources.length > 0 && (
                  <p className="text-xs opacity-75">
                    Sources: {ind.sources.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {audit.recommendations.length > 0 && (
        <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <h3 className="font-bold text-amber-900 mb-3">⚙️ Recommendations</h3>
          <ul className="space-y-2">
            {audit.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-amber-900">{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Healthy Industries */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Top Healthy Industries
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {audit.healthyIndustries.map((ind) => (
            <div key={ind.industry} className="bg-white p-3 rounded-lg border border-green-200">
              <p className="font-bold capitalize text-sm">{ind.industry}</p>
              <p className="text-2xl font-bold text-green-600">{ind.jobs}</p>
              <p className="text-xs text-slate-600">+{ind.jobsInLastHour || 0}/hr</p>
            </div>
          ))}
        </div>
      </div>

      {/* Source Health */}
      {audit.sourceHealth.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Recent Source Health</h3>
          <div className="space-y-2">
            {audit.sourceHealth.map((sh, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold capitalize text-sm">{sh.sourceType}</span>
                  <div className="text-xs">
                    <span className="text-green-600 font-bold">{sh.workingCount} ✓</span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-red-600 font-bold">{sh.brokenCount} ✗</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(sh.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
