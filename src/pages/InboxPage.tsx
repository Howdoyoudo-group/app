import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  Mail,
  Reply,
  Trash2,
  Loader2,
  CheckCircle2,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import MembersArea from "@/components/MembersArea";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MentorRequestsInbox from "@/components/MentorRequestsInbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LIME = "hsl(120, 100%, 45%)";

interface EmployerRequest {
  id: string;
  company_name: string;
  message: string | null;
  created_at: string;
  status: string;
  reply_message: string | null;
  replied_at: string | null;
}

export default function InboxPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [employerRequests, setEmployerRequests] = useState<EmployerRequest[]>([]);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyBusyFor, setReplyBusyFor] = useState<string | null>(null);
  const [deleteBusyFor, setDeleteBusyFor] = useState<string | null>(null);
  const [consentOpenFor, setConsentOpenFor] = useState<string | null>(null);
  const [shareDefault, setShareDefault] = useState(false);
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent("/inbox")}`);
      return;
    }
    let cancelled = false;
    (async () => {
      const [requestsRes, profileRes] = await Promise.all([
        supabase
          .from("contact_requests")
          .select("id, message, reply_message, replied_at, created_at, status, employer_companies:company_id(name)")
          .eq("candidate_user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("share_details_default").eq("id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setEmployerRequests(
        (requestsRes.data || []).map((r: any) => ({
          id: r.id,
          company_name: r.employer_companies?.name ?? "An employer",
          message: r.message,
          created_at: r.created_at,
          status: r.status,
          reply_message: r.reply_message ?? null,
          replied_at: r.replied_at ?? null,
        }))
      );
      setShareDefault(!!(profileRes.data as any)?.share_details_default);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Delete this message? You won't be able to recover it.")) return;
    setDeleteBusyFor(id);
    try {
      const { error } = await supabase.from("contact_requests").delete().eq("id", id);
      if (error) throw error;
      setEmployerRequests((prev) => prev.filter((r) => r.id !== id));
      if (replyOpenFor === id) setReplyOpenFor(null);
      toast({ title: "Message deleted" });
    } catch (e: any) {
      toast({ title: "Couldn't delete", description: e.message, variant: "destructive" });
    } finally {
      setDeleteBusyFor(null);
    }
  };

  const handleReplyClick = (id: string) => {
    const body = (replyDraft[id] || "").trim();
    if (!body) {
      toast({ title: "Write something first" });
      return;
    }
    if (shareDefault) {
      void sendReplyWithConsent(id, true, false);
    } else {
      setConsentOpenFor(id);
    }
  };

  const sendReplyWithConsent = useCallback(
    async (id: string, shareDetails: boolean, makeDefault: boolean) => {
      const body = (replyDraft[id] || "").trim();
      if (!body) return;
      setConsentOpenFor(null);
      setReplyBusyFor(id);
      try {
        const nowIso = new Date().toISOString();
        const { data, error } = await supabase
          .from("contact_requests")
          .update({
            reply_message: body,
            replied_at: nowIso,
            status: "replied",
            details_shared: shareDetails,
          })
          .eq("id", id)
          .select("id");
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(
            "We couldn't save your reply. This usually means you're signed in to a different account than the one that received the message."
          );
        }
        if (makeDefault && user) {
          const { error: prefErr } = await supabase
            .from("profiles")
            .update({ share_details_default: true })
            .eq("id", user.id);
          if (!prefErr) setShareDefault(true);
        }
        setEmployerRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, reply_message: body, replied_at: nowIso, status: "replied" } : r))
        );
        setReplyDraft((d) => ({ ...d, [id]: "" }));
        setReplyOpenFor(null);
        toast({
          title: "Reply sent",
          description: shareDetails
            ? "Your contact details have been shared with the employer."
            : "Reply sent without sharing your contact details.",
        });
      } catch (e: any) {
        console.error("[reply] failed", e);
        toast({ title: "Couldn't send reply", description: e.message, variant: "destructive" });
      } finally {
        setReplyBusyFor(null);
      }
    },
    [replyDraft, user]
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/inbox" title="Inbox — Howdoyoudo?" />

      <main className="px-4 sm:px-6 md:px-12 max-w-3xl mx-auto py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="w-12 h-12 rounded-full bg-primary/15 border-2 border-foreground flex items-center justify-center shrink-0">
            <Inbox className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h1 className="font-display font-900 text-3xl md:text-4xl uppercase tracking-tight leading-none">
              Inbox<span style={{ color: LIME }}>.</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Employer requests, mentoring and messages — all in one place.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* ── Employer requests ── */}
          <section className="border-2 border-foreground rounded-2xl overflow-hidden">
            <div className="bg-primary/10 border-b-2 border-foreground px-4 py-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <h2 className="font-display font-900 text-sm uppercase tracking-wider text-foreground">
                You've caught their eye
              </h2>
              <span className="ml-auto font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">
                {employerRequests.length} {employerRequests.length === 1 ? "request" : "requests"}
              </span>
            </div>
            {employerRequests.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-body text-sm text-muted-foreground">
                  No employer requests yet. When a company spots your profile and wants to chat, it'll land here.
                </p>
              </div>
            ) : (
              <ul className="divide-y-2 divide-foreground/10">
                {employerRequests.map((req) => {
                  const isReplyOpen = replyOpenFor === req.id;
                  const hasReplied = !!req.reply_message;
                  return (
                    <li key={req.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-foreground flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-display font-800 text-sm text-foreground">{req.company_name}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            {!hasReplied && (
                              <button
                                type="button"
                                onClick={() => setReplyOpenFor(isReplyOpen ? null : req.id)}
                                className="p-1.5 rounded-md hover:bg-primary/10 text-foreground"
                                aria-label="Reply"
                                title="Reply"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req.id)}
                              disabled={deleteBusyFor === req.id}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"
                              aria-label="Delete"
                              title="Delete"
                            >
                              {deleteBusyFor === req.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed mt-0.5">
                          {req.message ?? `${req.company_name} have their eye on you and would like to chat.`}
                        </p>
                        <p className="font-body text-[10px] text-muted-foreground/70 mt-1">
                          {new Date(req.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {req.status !== "pending" && ` · ${req.status}`}
                        </p>

                        {hasReplied && (
                          <div className="mt-2 border-2 border-foreground/20 bg-primary/5 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <CheckCircle2 className="w-3 h-3 text-primary" />
                              <span className="font-display text-[10px] font-700 uppercase tracking-wider text-foreground">
                                Your reply
                              </span>
                              {req.replied_at && (
                                <span className="font-body text-[10px] text-muted-foreground/70">
                                  · {new Date(req.replied_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>
                              )}
                            </div>
                            <p className="font-body text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                              {req.reply_message}
                            </p>
                          </div>
                        )}

                        {isReplyOpen && !hasReplied && (
                          <div className="mt-2 border-2 border-foreground rounded-xl p-2 bg-background">
                            <textarea
                              value={replyDraft[req.id] || ""}
                              onChange={(e) => setReplyDraft((d) => ({ ...d, [req.id]: e.target.value }))}
                              placeholder={`Write a quick reply to ${req.company_name}…`}
                              rows={3}
                              className="w-full text-xs font-body bg-transparent border-0 focus:outline-none focus:ring-0 resize-none placeholder:text-muted-foreground/60"
                            />
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-foreground/10">
                              <button
                                type="button"
                                onClick={() => setReplyOpenFor(null)}
                                className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground hover:text-foreground px-2 py-1"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReplyClick(req.id)}
                                disabled={replyBusyFor === req.id || !(replyDraft[req.id] || "").trim()}
                                className="inline-flex items-center gap-1 font-display text-[10px] font-700 uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1.5 rounded-md disabled:opacity-50 hover:opacity-90"
                              >
                                {replyBusyFor === req.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                Send
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ── Mentoring requests (incoming & outgoing) ── */}
          <MentorRequestsInbox />

          {/* ── Member messenger (chats, requests, directory) ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-foreground" />
              <h2 className="font-display font-900 text-sm uppercase tracking-wider text-foreground">
                Member messages
              </h2>
            </div>
            <MembersArea defaultView="messages" />
          </section>
        </div>
      </main>

      <Footer />

      {/* Consent dialog for sharing contact details with employer */}
      <AlertDialog open={!!consentOpenFor} onOpenChange={(open) => !open && setConsentOpenFor(null)}>
        <AlertDialogContent className="border-2 border-foreground rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-900 uppercase tracking-tight">
              Share your contact details?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm leading-relaxed">
              The employer will be able to see your name, email, phone and photo so they can follow up directly. Your
              reply will be sent either way - sharing details just makes it easier for them to reach you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
            <Button
              type="button"
              onClick={() => consentOpenFor && sendReplyWithConsent(consentOpenFor, true, true)}
              className="w-full font-display font-700 uppercase tracking-wider text-xs"
            >
              Always share my details
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => consentOpenFor && sendReplyWithConsent(consentOpenFor, true, false)}
              className="w-full font-display font-700 uppercase tracking-wider text-xs"
            >
              Just this once
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => consentOpenFor && sendReplyWithConsent(consentOpenFor, false, false)}
              className="w-full font-display font-700 uppercase tracking-wider text-xs border-2 border-foreground"
            >
              Send reply without sharing
            </Button>
            <button
              type="button"
              onClick={() => setConsentOpenFor(null)}
              className="w-full text-xs font-body text-muted-foreground hover:text-foreground pt-1"
            >
              Cancel
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
