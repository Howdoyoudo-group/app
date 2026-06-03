import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";

const REASONS: { value: string; label: string }[] = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "sexual", label: "Sexual or explicit content" },
  { value: "racism", label: "Racism or discrimination" },
  { value: "hate", label: "Hate speech or threats" },
  { value: "spam", label: "Spam or scam" },
  { value: "impersonation", label: "Impersonation" },
  { value: "underage", label: "Under 16 / safeguarding concern" },
  { value: "other", label: "Other" },
];

interface ReportUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId: string;
  reportedName?: string;
  context?: string;
}

export function ReportUserDialog({ open, onOpenChange, reportedUserId, reportedName, context }: ReportUserDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!reason) {
      toast.error("Please choose a reason");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to report a member");
      return;
    }
    if (user.id === reportedUserId) {
      toast.error("You can't report yourself");
      return;
    }
    setSending(true);
    const { error } = await (supabase as any).from("user_reports").insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason,
      details: details.trim().slice(0, 1000) || null,
      context: context?.slice(0, 200) || null,
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't send report. Please try again.");
      return;
    }
    toast.success("Report received. Our team will review it.");
    setReason("");
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" />
            Report {reportedName || "this member"}
          </DialogTitle>
          <DialogDescription>
            Reports are confidential. We'll review and may suspend the account if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider font-display">Reason</Label>
            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 p-2 rounded-md border border-border cursor-pointer hover:border-primary/50">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="report-details" className="text-xs uppercase tracking-wider font-display">
              What happened? (optional)
            </Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
              placeholder="Add any context that will help us investigate."
              className="mt-2"
              rows={4}
            />
            <p className="text-[11px] text-muted-foreground mt-1">{details.length}/1000</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>Cancel</Button>
          <Button onClick={submit} disabled={sending || !reason} variant="destructive">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
