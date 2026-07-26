import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Props = {
  onTranscript?: (role: "user" | "assistant", text: string) => void;
};

export function HowdyVoiceButton({ onTranscript }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsPremium(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      setIsPremium(
        (data ?? []).some((r: any) => r.role === "premium" || r.role === "admin"),
      );
    })();
    return () => { cancelled = true; };
  }, [user]);

  const conversation = useConversation({
    onConnect: () => {
      startedAtRef.current = Date.now();
    },
    onDisconnect: () => {
      const start = startedAtRef.current;
      startedAtRef.current = null;
      if (start) {
        const seconds = Math.round((Date.now() - start) / 1000);
        supabase.functions.invoke("howdy-voice-log", {
          body: { duration_seconds: seconds },
        }).catch(() => {});
      }
    },
    onMessage: (msg: any) => {
      if (!onTranscript) return;
      const text = typeof msg?.message === "string" ? msg.message.trim() : "";
      if (!text) return;
      const role = msg?.role ?? msg?.source;
      if (role === "user") onTranscript("user", text);
      else if (role === "ai" || role === "assistant" || role === "agent") {
        onTranscript("assistant", text);
      }
    },
    onError: (err: any) => {
      console.error("Voice error", err);
      toast({
        variant: "destructive",
        title: "Voice error",
        description: typeof err === "string" ? err : "Voice connection dropped.",
      });
    },
  });

  const status = conversation.status;
  const isConnected = status === "connected";

  const start = useCallback(async () => {
    if (!user) {
      toast({
        title: "Sign in to chat by voice",
        description: "Voice mode is for signed-in members (10 min/day).",
      });
      return;
    }
    setIsStarting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke(
        "howdy-voice-token",
      );
      if (error || !data?.token) {
        const msg = (data as any)?.error || error?.message || "Could not start voice";
        toast({ variant: "destructive", title: "Voice unavailable", description: msg });
        return;
      }
      // Only include overrides when the server actually returned one, so
      // voice still degrades to the agent's default (contextless but
      // working) behaviour if anything's missing, rather than failing to
      // connect.
      const promptOverride = (data as any)?.prompt_override as string | undefined;
      const firstMessage = (data as any)?.first_message as string | undefined;
      const overrides = promptOverride
        ? { agent: { prompt: { prompt: promptOverride }, ...(firstMessage ? { firstMessage } : {}) } }
        : undefined;

      // WebRTC path (livekit.rtc.elevenlabs.io/rtc/v1/validate) currently 404s
      // for this workspace — use WebSocket signed URL when available.
      if ((data as any)?.signed_url) {
        await conversation.startSession({
          signedUrl: (data as any).signed_url,
          connectionType: "websocket",
          ...(overrides ? { overrides } : {}),
        });
      } else {
        await conversation.startSession({
          conversationToken: data.token,
          connectionType: "webrtc",
          ...(overrides ? { overrides } : {}),
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Microphone needed",
        description: e?.message ?? "Allow mic access to chat by voice.",
      });
    } finally {
      setIsStarting(false);
    }
  }, [user, conversation, toast]);

  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversation.status === "connected") {
        Promise.resolve(conversation.endSession()).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide voice button entirely for non-premium users (premium feature).
  if (isPremium === false) return null;
  if (isPremium === null) return null; // still loading

  const label = isConnected
    ? conversation.isSpeaking ? "Howdy talking…" : "Listening… tap to end"
    : isStarting ? "Connecting…" : "Talk to Howdy";

  return (
    <button
      onClick={isConnected ? stop : start}
      disabled={isStarting}
      className={`rounded-full p-1.5 transition-colors flex items-center gap-1 text-xs font-bold ${
        isConnected
          ? "bg-background text-primary"
          : "hover:bg-primary-foreground/20"
      }`}
      title={label}
      aria-label={label}
    >
      {isStarting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isConnected ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isConnected ? "End" : "Voice"}
      </span>
    </button>
  );
}

export function HowdyVoiceButtonWrapped(props: Props) {
  return (
    <ConversationProvider>
      <HowdyVoiceButton {...props} />
    </ConversationProvider>
  );
}
