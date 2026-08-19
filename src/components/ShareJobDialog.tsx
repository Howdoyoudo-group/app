import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Job } from "@/hooks/useJobs";

interface ShareJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
}

export function ShareJobDialog({ open, onOpenChange, job }: ShareJobDialogProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareLink = `${window.location.origin}/marketplace?job=${job.dbId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareViaEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke("share-job-email", {
        body: {
          jobId: job.dbId,
          jobTitle: job.title,
          company: job.company,
          email,
          shareLink,
          senderName: user?.user_metadata?.full_name || "A How Do You Do user",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Job shared with ${email}`);
      setEmail("");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to share job");
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  const handleShareWithCommunity = async () => {
    if (!userSearch) {
      toast.error("Please select a community member");
      return;
    }
    setSharing(true);
    try {
      // TODO: Call edge function to send in-app notification
      // const { error } = await supabase.functions.invoke("share-job-with-user", {
      //   body: { jobId: job.dbId, userId: selectedUserId }
      // });

      toast.success("Job shared with community member");
      setUserSearch("");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to share job");
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Job</DialogTitle>
          <DialogDescription>
            {job.title} at {job.company}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy this link to share the job. It will always link back to How Do You Do.
            </p>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="text-xs"
              />
              <Button
                onClick={handleCopyLink}
                size="sm"
                variant="outline"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter an email address to share this job.
            </p>
            <Input
              type="email"
              placeholder="someone@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={handleShareViaEmail}
              disabled={sharing || !email}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share with a member of the How Do You Do community.
            </p>
            <Input
              placeholder="Search community members..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Coming soon: member search and in-app notifications
            </div>
            <Button
              onClick={handleShareWithCommunity}
              disabled={true}
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Share with Member
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
