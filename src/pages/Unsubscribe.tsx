import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const processUnsubscribe = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
          body: { token },
        });

        if (error) {
          setStatus("error");
          return;
        }

        if (data?.email) setEmail(data.email);

        if (data?.message === "Already unsubscribed") {
          setStatus("already");
        } else {
          setStatus("success");
        }
      } catch {
        setStatus("error");
      }
    };

    processUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h1 className="font-display text-2xl font-700">Processing...</h1>
            <p className="text-muted-foreground font-body text-sm">
              Just a moment while we process your request.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <h1 className="font-display text-2xl font-700">
              Unsubscribed<span className="text-primary">.</span>
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              {email ? `We've removed ${email} from our mailing list.` : "You've been removed from our mailing list."}{" "}
              You won't receive any more emails from us.
            </p>
            <p className="text-muted-foreground font-body text-xs">
              If this was a mistake, you can always sign up again on our website.
            </p>
          </div>
        )}

        {status === "already" && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h1 className="font-display text-2xl font-700">
              Already unsubscribed<span className="text-primary">.</span>
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              {email ? `${email} was` : "This email was"} already removed from our mailing list.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="font-display text-2xl font-700">
              Something went wrong<span className="text-primary">.</span>
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              We couldn't process your unsubscribe request. The link may be invalid or expired.
              Please contact us at{" "}
              <a href="mailto:privacy@howdoyoudo.group" className="text-primary hover:underline">
                privacy@howdoyoudo.group
              </a>{" "}
              to be removed manually.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Unsubscribe;