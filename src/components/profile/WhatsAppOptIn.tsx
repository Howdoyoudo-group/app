import React, { useEffect, useState } from "react";
import { MessageCircle, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const inputBase =
  "w-full px-3 py-2 rounded-xl border-2 border-foreground bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export const WhatsAppOptIn: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles")
          .select("whatsapp_number, whatsapp_verified_at, whatsapp_opt_in")
          .eq("id", user.id).maybeSingle(),
      ]);
      setIsPremium((roles ?? []).some((r: any) => r.role === "premium" || r.role === "admin"));
      if (profile) {
        setVerifiedPhone(profile.whatsapp_verified_at ? profile.whatsapp_number : null);
        setOptIn(Boolean(profile.whatsapp_opt_in));
        setPhone(profile.whatsapp_number ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const sendCode = async () => {
    if (!phone.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("whatsapp-send-verification", { body: { phone } });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({ title: "Couldn't send code", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    setStep("sent");
    toast({ title: "Code sent", description: "Check WhatsApp for your 6-digit code." });
  };

  const verifyCode = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("whatsapp-verify-code", { body: { code } });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({ title: "Verification failed", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    setVerifiedPhone((data as any)?.phone ?? phone);
    setOptIn(true);
    setStep("idle");
    setCode("");
    toast({ title: "WhatsApp connected", description: "You'll get a daily Howdy digest." });
  };

  const toggleOptIn = async (next: boolean) => {
    if (!user) return;
    setOptIn(next);
    await supabase.from("profiles").update({ whatsapp_opt_in: next }).eq("id", user.id);
  };

  const disconnect = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      whatsapp_opt_in: false, whatsapp_verified_at: null, whatsapp_number: null,
    }).eq("id", user.id);
    setVerifiedPhone(null); setOptIn(false); setPhone(""); setCode(""); setStep("idle");
    toast({ title: "WhatsApp disconnected" });
  };

  const sendTest = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("whatsapp-daily-digest", { body: { test_self: true } });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({ title: "Couldn't send test", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    const sent = (data as any)?.sent ?? 0;
    toast({
      title: sent > 0 ? "Test digest sent" : "Nothing to send yet",
      description: sent > 0
        ? "Check WhatsApp in a few seconds."
        : "No briefing or matched jobs available for your industry today.",
    });
  };

  if (loading) return <div className="h-10 flex items-center text-sm text-muted-foreground">Loading…</div>;

  if (!isPremium) {
    return (
      <div className="p-4 rounded-2xl border-2 border-dashed border-foreground/30 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-display font-700 text-sm">WhatsApp digest — Premium</span>
        </div>
        <p className="font-body text-xs text-muted-foreground">
          Get your morning briefing and top-matched jobs delivered to WhatsApp. Available to Premium members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <MessageCircle className="w-4 h-4 text-primary mt-0.5" />
        <div className="flex-1">
          <div className="font-display font-700 text-sm">WhatsApp digest</div>
          <p className="font-body text-xs text-muted-foreground">
            Daily morning briefing + 3 top-matched jobs from Howdy. Reply STOP any time.
          </p>
        </div>
      </div>

      {verifiedPhone ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl border-2 border-foreground bg-background">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-body text-sm">{verifiedPhone}</span>
            </div>
            <button onClick={disconnect} className="font-display text-xs font-700 text-muted-foreground hover:text-foreground underline">
              Disconnect
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={optIn} onChange={(e) => toggleOptIn(e.target.checked)} className="w-4 h-4" />
            <span className="font-body text-sm">Send me the daily digest</span>
          </label>
          <button
            onClick={sendTest}
            disabled={busy}
            className="w-full px-4 py-2 rounded-xl border-2 border-foreground bg-primary text-primary-foreground font-display font-700 text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Send test digest now
          </button>
        </div>
      ) : step === "idle" ? (
        <div className="flex gap-2">
          <input
            type="tel" placeholder="+44 7700 900000" value={phone}
            onChange={(e) => setPhone(e.target.value)} className={inputBase}
          />
          <button onClick={sendCode} disabled={busy || !phone.trim()}
            className="px-4 py-2 rounded-xl border-2 border-foreground bg-foreground text-background font-display font-700 text-sm disabled:opacity-50 flex items-center gap-1.5">
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Send code
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-body text-xs text-muted-foreground">
            Enter the 6-digit code we sent to {phone}.
            <br />
            <strong>Sandbox note:</strong> first message your join code to Twilio's sandbox number (you'll see this in setup).
          </p>
          <div className="flex gap-2">
            <input
              inputMode="numeric" maxLength={6} placeholder="123456" value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={inputBase}
            />
            <button onClick={verifyCode} disabled={busy || code.length !== 6}
              className="px-4 py-2 rounded-xl border-2 border-foreground bg-primary text-primary-foreground font-display font-700 text-sm disabled:opacity-50 flex items-center gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Verify
            </button>
          </div>
          <button onClick={() => { setStep("idle"); setCode(""); }} className="font-display text-xs font-700 text-muted-foreground underline">
            Use a different number
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppOptIn;
